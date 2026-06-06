import { useEffect, useState, useCallback } from 'react';
import { CalendarDays, LayoutGrid, List } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CoachTabs from '@/components/calendar/CoachTabs';
import WeekCalendar, { WeekCalendarNavState } from '@/components/calendar/WeekCalendar';
import BookingModal from '@/components/booking/BookingModal';
import RescheduleModal from '@/components/booking/RescheduleModal';
import LeaveModal from '@/components/booking/LeaveModal';
import { useBookingStore } from '@/store/useBookingStore';
import { useCoachStore } from '@/store/useCoachStore';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

type CalendarView = 'week' | 'day' | 'list';

export default function Calendar() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<CalendarView>('week');
  const [navState, setNavState] = useState<WeekCalendarNavState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { loadBookings } = useBookingStore();
  const { loadCoaches } = useCoachStore();

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadBookings(), loadCoaches()]);
      setIsLoaded(true);
    };
    init();
  }, [loadBookings, loadCoaches]);

  const handleNavStateChange = useCallback((state: WeekCalendarNavState) => {
    setNavState(state);
  }, []);

  const handleEmptyClick = useCallback((_date: string, _time: string, _coachId: string | null) => {
    setBookingModalOpen(true);
  }, []);

  const handleBookingClick = useCallback((booking: Booking) => {
    setActiveBookingId(booking.id);
    setRescheduleModalOpen(true);
  }, []);

  const handleBookingSuccess = useCallback(() => {
    setBookingModalOpen(false);
    setRescheduleModalOpen(false);
    setLeaveModalOpen(false);
    setActiveBookingId(null);
  }, []);

  const viewTabs: Array<{ key: CalendarView; label: string; icon: typeof CalendarDays }> = [
    { key: 'week', label: '周视图', icon: CalendarDays },
    { key: 'day', label: '日视图', icon: LayoutGrid },
    { key: 'list', label: '列表', icon: List },
  ];

  const animationDelays = [0, 50, 100, 150];

  return (
    <AppLayout initialRole="coach">
      <div className="flex flex-col gap-4 h-full min-h-0">
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-4 transition-all duration-500',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${animationDelays[0]}ms` }}
        >
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-wide text-ink-50">
              教练日历
            </h1>
            <p className="text-sm text-ink-400 mt-1">
              管理教练课程安排与预约
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex p-1 bg-ink-800 rounded-xl border border-ink-700">
              {viewTabs.map(({ key, label, icon: Icon }) => {
                const isActive = viewMode === key;
                return (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-gradient-orange text-white shadow-glow-orange'
                        : 'text-ink-300 hover:text-white hover:bg-ink-700/50'
                    )}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{label}</span>
                    {isActive && (
                      <span className="absolute inset-0 rounded-lg bg-orange/20 animate-pulse-slow pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 transition-all duration-500',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${animationDelays[1]}ms` }}
        >
          <CoachTabs />

          {navState && (
            <div className="flex items-center gap-2">
              <button
                onClick={navState.prevWeek}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-700 text-ink-200 transition-all hover:border-orange hover:text-orange"
              >
                <span className="text-lg">‹</span>
              </button>
              <button
                onClick={navState.goToday}
                className="rounded-lg border border-orange/50 bg-orange/10 px-4 py-1.5 text-sm font-medium text-orange transition-all hover:bg-orange/20"
              >
                今天
              </button>
              <button
                onClick={navState.nextWeek}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-700 text-ink-200 transition-all hover:border-orange hover:text-orange"
              >
                <span className="text-lg">›</span>
              </button>
              <span className="ml-2 font-heading text-lg font-semibold tracking-wide text-ink-100">
                {navState.dateRangeLabel}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex-1 min-h-[700px] transition-all duration-500',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${animationDelays[2]}ms` }}
        >
          {viewMode === 'week' && (
            <WeekCalendar
              showHeader={false}
              showFAB={false}
              onEmptyClick={handleEmptyClick}
              onBookingClick={handleBookingClick}
              onNavStateChange={handleNavStateChange}
              className="h-full"
            />
          )}
          {viewMode === 'day' && (
            <div className="h-full flex items-center justify-center card p-12">
              <div className="text-center">
                <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-ink-500" />
                <p className="text-ink-300 font-heading text-lg">日视图</p>
                <p className="text-ink-500 text-sm mt-1">开发中，敬请期待</p>
              </div>
            </div>
          )}
          {viewMode === 'list' && (
            <div className="h-full flex items-center justify-center card p-12">
              <div className="text-center">
                <List className="mx-auto mb-4 h-12 w-12 text-ink-500" />
                <p className="text-ink-300 font-heading text-lg">列表视图</p>
                <p className="text-ink-500 text-sm mt-1">开发中，敬请期待</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />
      <RescheduleModal
        open={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setActiveBookingId(null);
        }}
        bookingId={activeBookingId}
        onSuccess={handleBookingSuccess}
      />
      <LeaveModal
        open={leaveModalOpen}
        onClose={() => {
          setLeaveModalOpen(false);
          setActiveBookingId(null);
        }}
        bookingId={activeBookingId}
        onSuccess={handleBookingSuccess}
      />
    </AppLayout>
  );
}
