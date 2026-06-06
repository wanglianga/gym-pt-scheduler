import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoachStore } from '@/store/useCoachStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useMemberStore } from '@/store/useMemberStore';
import type { Booking } from '@/types';
import { formatDate, getWeekDates, getWeekdayName, getTimeSlots, isToday, addDays } from '@/utils/date';
import CoachTabs from './CoachTabs';
import CalendarSlot from './CalendarSlot';

const HOUR_HEIGHT = 64;
const TIME_COL_WIDTH = 72;
const DAY_COL_WIDTH = 160;

export interface WeekCalendarNavState {
  weekDates: Date[];
  prevWeek: () => void;
  nextWeek: () => void;
  goToday: () => void;
  dateRangeLabel: string;
}

interface WeekCalendarProps {
  onEmptyClick?: (date: string, time: string, coachId: string | null) => void;
  onBookingClick?: (booking: Booking) => void;
  showHeader?: boolean;
  showFAB?: boolean;
  className?: string;
  onNavStateChange?: (state: WeekCalendarNavState) => void;
}

export default function WeekCalendar({
  onEmptyClick,
  onBookingClick,
  showHeader = true,
  showFAB = true,
  className,
  onNavStateChange,
}: WeekCalendarProps) {
  const [weekBase, setWeekBase] = useState<Date>(new Date());
  const { selectedCoachId, loadCoaches } = useCoachStore();
  const { bookings, loadBookings, getBookingsByCoachAndDate } = useBookingStore();
  const { loadMembers } = useMemberStore();

  useEffect(() => {
    loadCoaches();
    loadBookings();
    loadMembers();
  }, [loadCoaches, loadBookings, loadMembers]);

  const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase]);
  const timeSlots = useMemo(() => getTimeSlots(), []);

  const prevWeek = () => setWeekBase((d) => addDays(d, -7));
  const nextWeek = () => setWeekBase((d) => addDays(d, 7));
  const goToday = () => setWeekBase(new Date());
  const dateRangeLabel = `${formatDate(weekDates[0], 'MM/DD')} - ${formatDate(weekDates[6], 'MM/DD/YYYY')}`;

  useEffect(() => {
    onNavStateChange?.({
      weekDates,
      prevWeek,
      nextWeek,
      goToday,
      dateRangeLabel,
    });
  }, [weekDates, onNavStateChange]);

  const handleEmptyClick = (date: string, time: string) => {
    if (onEmptyClick) {
      onEmptyClick(date, time, selectedCoachId);
    } else {
      console.log('创建预约', { date, time, coachId: selectedCoachId });
    }
  };

  const handleBookingClick = (booking: Booking) => {
    if (onBookingClick) {
      onBookingClick(booking);
    } else {
      console.log('查看预约', booking);
    }
  };

  const getBookingForSlot = (dateStr: string, timeStr: string): Booking | undefined => {
    if (!selectedCoachId) return undefined;
    const dayBookings = getBookingsByCoachAndDate(selectedCoachId, dateStr);

    for (const b of dayBookings) {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      const [slotH, slotM] = timeStr.split(':').map(Number);

      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const slotMin = slotH * 60 + slotM;

      if (slotMin >= startMin && slotMin < endMin) {
        return b;
      }
    }
    return undefined;
  };

  const isBookingStartSlot = (booking: Booking, timeStr: string): boolean => {
    const [startH, startM] = booking.startTime.split(':').map(Number);
    const [slotH, slotM] = timeStr.split(':').map(Number);
    return startH === slotH && startM === slotM;
  };

  const getBookingRowSpan = (booking: Booking): number => {
    const [startH, startM] = booking.startTime.split(':').map(Number);
    const [endH, endM] = booking.endTime.split(':').map(Number);
    const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(1, Math.round(durationMin / 60));
  };

  const gridTemplateRows = useMemo(() => {
    return `repeat(${timeSlots.length}, ${HOUR_HEIGHT}px)`;
  }, [timeSlots.length]);

  const navControls = (
    <div className="flex items-center gap-2">
      <button
        onClick={prevWeek}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-700 text-ink-200 transition-all hover:border-orange hover:text-orange"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={goToday}
        className="rounded-lg border border-orange/50 bg-orange/10 px-4 py-1.5 text-sm font-medium text-orange transition-all hover:bg-orange/20"
      >
        今天
      </button>
      <button
        onClick={nextWeek}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-700 text-ink-200 transition-all hover:border-orange hover:text-orange"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="ml-2 font-heading text-lg font-semibold tracking-wide text-ink-100">
        {dateRangeLabel}
      </span>
    </div>
  );

  return (
    <div className={cn('flex h-full flex-col rounded-xl border border-ink-700 bg-ink-800 shadow-industrial', className)}>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 p-4">
          <CoachTabs />
          {navControls}
        </div>
      )}

      <div className="relative flex-1 overflow-auto">
        <div
          className="min-w-max"
          style={{ width: TIME_COL_WIDTH + DAY_COL_WIDTH * 7 }}
        >
          <div className="sticky top-0 z-20 flex border-b border-ink-700 bg-ink-800">
            <div
              className="sticky left-0 z-10 flex items-center justify-center border-r border-ink-700 bg-ink-800"
              style={{ width: TIME_COL_WIDTH, height: 56 }}
            >
              <span className="text-xs font-medium text-ink-400">时间</span>
            </div>
            {weekDates.map((date) => {
              const dateStr = formatDate(date);
              const today = isToday(date);
              return (
                <div
                  key={dateStr}
                  className={cn(
                    'flex flex-col items-center justify-center border-r border-ink-700',
                    today && 'bg-orange/5'
                  )}
                  style={{ width: DAY_COL_WIDTH, height: 56 }}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      today ? 'text-orange' : 'text-ink-400'
                    )}
                  >
                    {getWeekdayName(date, true)}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 font-heading text-lg font-semibold',
                      today ? 'text-orange' : 'text-ink-100'
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative flex">
            <div className="sticky left-0 z-10 border-r border-ink-700 bg-ink-800">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className="flex items-start justify-end border-b border-ink-700/50 pr-2 pt-1"
                  style={{ width: TIME_COL_WIDTH, height: HOUR_HEIGHT }}
                >
                  <span className="text-xs font-medium text-ink-400">{slot.time}</span>
                </div>
              ))}
            </div>

            {weekDates.map((date) => {
              const dateStr = formatDate(date);
              const today = isToday(date);
              return (
                <div
                  key={dateStr}
                  className={cn(
                    'relative border-r border-ink-700/50',
                    today && 'bg-orange/5'
                  )}
                  style={{ width: DAY_COL_WIDTH }}
                >
                  <div
                    className="grid"
                    style={{ gridTemplateRows, height: HOUR_HEIGHT * timeSlots.length }}
                  >
                    {timeSlots.map((slot) => {
                      const booking = getBookingForSlot(dateStr, slot.time);
                      const isStart = booking ? isBookingStartSlot(booking, slot.time) : true;
                      const rowSpan = booking ? getBookingRowSpan(booking) : 1;

                      return (
                        <div
                          key={`${dateStr}-${slot.time}`}
                          className="relative border-b border-ink-700/30"
                        >
                          <CalendarSlot
                            booking={booking}
                            time={slot.time}
                            date={dateStr}
                            onEmptyClick={handleEmptyClick}
                            onBookingClick={handleBookingClick}
                            rowSpan={rowSpan}
                            isStartSlot={isStart}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showFAB && (
          <button
            onClick={() => handleEmptyClick(formatDate(new Date()), '09:00')}
            className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-glow-orange transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(255,107,53,0.6)] active:scale-95"
            aria-label="新建预约"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
