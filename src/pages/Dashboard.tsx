import { useEffect, useState, useMemo } from 'react';
import {
  CalendarDays,
  Users,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import RoleTabs from '@/components/layout/RoleTabs';
import type { UserRole } from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import WeekCalendar from '@/components/calendar/WeekCalendar';
import CoachTabs from '@/components/calendar/CoachTabs';
import MemberSearch from '@/components/member/MemberSearch';
import TodoList from '@/components/dashboard/TodoList';
import MemberCard from '@/components/member/MemberCard';
import PackageCard from '@/components/member/PackageCard';
import BookingModal from '@/components/booking/BookingModal';
import RescheduleModal from '@/components/booking/RescheduleModal';
import LeaveModal from '@/components/booking/LeaveModal';
import { useBookingStore } from '@/store/useBookingStore';
import { usePackageStore } from '@/store/usePackageStore';
import { useMemberStore } from '@/store/useMemberStore';
import type { Member } from '@/types';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>('receptionist');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { loadBookings, getTodayBookings, bookings } = useBookingStore();
  const { loadPackages, getExpiringPackages, getLowBalancePackages, getActivePackagesByMember } = usePackageStore();
  const { loadMembers, members } = useMemberStore();

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadBookings(), loadPackages(), loadMembers()]);
      setIsLoaded(true);
    };
    init();
  }, [loadBookings, loadPackages, loadMembers]);

  const stats = useMemo(() => {
    const todayBookings = getTodayBookings();
    const todayCoursesCount = todayBookings.filter(
      (b) => b.status !== 'cancelled' && b.status !== 'no_show'
    ).length;

    const todayVisitedMembers = new Set(
      todayBookings
        .filter((b) => b.status === 'completed' || b.status === 'confirmed')
        .map((b) => b.memberId)
    ).size;

    const pendingCheckin = todayBookings.filter(
      (b) => b.status === 'scheduled' || b.status === 'confirmed'
    ).length;

    const expiringCount = getExpiringPackages(30).length;
    const lowBalanceCount = getLowBalancePackages(5).length;
    const packageAlerts = expiringCount + lowBalanceCount;

    return {
      todayCourses: todayCoursesCount,
      todayVisited: todayVisitedMembers,
      pendingCheckin,
      packageAlerts,
    };
  }, [bookings, members, getTodayBookings, getExpiringPackages, getLowBalancePackages]);

  const selectedMemberPackages = useMemo(() => {
    if (!selectedMember) return [];
    return getActivePackagesByMember(selectedMember.id);
  }, [selectedMember, getActivePackagesByMember]);

  const handleBookMember = (member: Member) => {
    setSelectedMember(member);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingModalOpen(false);
    setRescheduleModalOpen(false);
    setLeaveModalOpen(false);
    setActiveBookingId(null);
  };

  const animationDelays = [0, 50, 100, 150, 200, 250, 300];

  return (
    <AppLayout initialRole={currentRole}>
      <div className="flex flex-col gap-6 h-full">
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-4 transition-all duration-500',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${animationDelays[0]}ms` }}
        >
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-wide text-ink-50">
              工作台
            </h1>
            <p className="text-sm text-ink-400 mt-1">
              欢迎回来，快速查看今日运营概况
            </p>
          </div>
          <RoleTabs currentRole={currentRole} onRoleChange={setCurrentRole} />
        </div>

        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${animationDelays[1]}ms` }}
        >
          <StatCard
            title="今日课程数"
            value={stats.todayCourses}
            icon={CalendarDays}
            change={12}
            unit="节"
            iconBg="bg-orange/15"
            iconColor="text-orange"
          />
          <StatCard
            title="到店会员数"
            value={stats.todayVisited}
            icon={Users}
            change={8}
            unit="人"
            iconBg="bg-lime/15"
            iconColor="text-lime"
          />
          <StatCard
            title="待签到课程"
            value={stats.pendingCheckin}
            icon={ClipboardList}
            unit="节"
            iconBg="bg-info/15"
            iconColor="text-info"
          />
          <StatCard
            title="课包告警"
            value={stats.packageAlerts}
            icon={AlertTriangle}
            unit="个"
            iconBg="bg-danger/15"
            iconColor="text-danger"
          />
        </div>

        <div
          className={cn(
            'grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0 transition-all duration-500',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${animationDelays[2]}ms` }}
        >
          <div className="xl:col-span-2 flex flex-col gap-4 min-h-0">
            <div
              className={cn(
                'transition-all duration-500',
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${animationDelays[3]}ms` }}
            >
              <CoachTabs />
            </div>
            <div
              className={cn(
                'flex-1 min-h-[600px] transition-all duration-500',
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${animationDelays[4]}ms` }}
            >
              <WeekCalendar />
            </div>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <div
              className={cn(
                'transition-all duration-500',
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${animationDelays[3]}ms` }}
            >
              <MemberSearch onSelect={setSelectedMember} />
            </div>

            <div
              className={cn(
                'flex-1 min-h-[300px] transition-all duration-500',
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${animationDelays[4]}ms` }}
            >
              <TodoList />
            </div>

            {selectedMember && (
              <div
                className={cn(
                  'flex flex-col gap-4 transition-all duration-500 animate-slide-up',
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                )}
                style={{ transitionDelay: `${animationDelays[5]}ms` }}
              >
                <MemberCard
                  member={selectedMember}
                  onBook={handleBookMember}
                />
                {selectedMemberPackages.length > 0 && (
                  <PackageCard pkg={selectedMemberPackages[0]} />
                )}
              </div>
            )}
          </div>
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
