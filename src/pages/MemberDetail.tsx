import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  CalendarDays,
  Clock,
  CalendarPlus,
  Pencil,
  ArrowLeft,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout';
import {
  BodyMetricsChart,
  PackageCard,
  TrainingGoal,
} from '@/components/member';
import BookingModal from '@/components/booking/BookingModal';
import { useMemberStore } from '@/store/useMemberStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePackageStore } from '@/store/usePackageStore';
import { useCoachStore } from '@/store/useCoachStore';
import type { BookingStatus } from '@/types';
import { MEMBER_LEVEL_LABEL, BOOKING_STATUS_LABEL, SPECIALTY_LABEL } from '@/types';
import { formatDate, parseDate, daysBetween } from '@/utils/date';

const levelBadgeClass: Record<string, string> = {
  basic: 'bg-ink-600 text-ink-200 border border-ink-500',
  silver: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
  gold: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  platinum: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
  diamond: 'bg-orange/20 text-orange border border-orange/40',
};

const bookingStatusBadgeClass: Record<BookingStatus, string> = {
  scheduled: 'bg-ink-600 text-ink-200 border border-ink-500',
  confirmed: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
  completed: 'bg-lime/20 text-lime border border-lime/40',
  cancelled: 'bg-ink-600 text-ink-300 border border-ink-500',
  no_show: 'bg-danger/20 text-danger border border-danger/40',
  leave: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
};

export default function MemberDetail() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const loadMembers = useMemberStore((s) => s.loadMembers);
  const getMemberById = useMemberStore((s) => s.getMemberById);
  const members = useMemberStore((s) => s.members);

  const loadBookings = useBookingStore((s) => s.loadBookings);
  const getBookingsByMember = useBookingStore((s) => s.getBookingsByMember);
  const bookings = useBookingStore((s) => s.bookings);

  const loadPackages = usePackageStore((s) => s.loadPackages);
  const getPackagesByMember = usePackageStore((s) => s.getPackagesByMember);
  const packages = usePackageStore((s) => s.packages);

  const loadCoaches = useCoachStore((s) => s.loadCoaches);
  const getCoachById = useCoachStore((s) => s.getCoachById);
  const coaches = useCoachStore((s) => s.coaches);

  useEffect(() => {
    if (members.length === 0) loadMembers();
    if (bookings.length === 0) loadBookings();
    if (packages.length === 0) loadPackages();
    if (coaches.length === 0) loadCoaches();
  }, [members.length, bookings.length, packages.length, coaches.length, loadMembers, loadBookings, loadPackages, loadCoaches]);

  const member = memberId ? getMemberById(memberId) : undefined;

  const memberPackages = useMemo(() => {
    if (!memberId) return [];
    return getPackagesByMember(memberId);
  }, [memberId, getPackagesByMember]);

  const recentBookings = useMemo(() => {
    if (!memberId) return [];
    return getBookingsByMember(memberId)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
        const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [memberId, getBookingsByMember]);

  const lastVisit = useMemo(() => {
    if (!memberId) return null;
    const completed = getBookingsByMember(memberId)
      .filter((b) => b.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return completed.length > 0 ? completed[0].date : null;
  }, [memberId, getBookingsByMember]);

  const lastVisitText = useMemo(() => {
    if (!lastVisit) return '暂无到店记录';
    const days = daysBetween(parseDate(lastVisit), new Date());
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return formatDate(parseDate(lastVisit), 'YYYY-MM-DD');
  }, [lastVisit]);

  if (!member) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="card p-10 text-center max-w-md w-full">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-danger/10 flex items-center justify-center border border-danger/30">
              <AlertCircle className="w-10 h-10 text-danger" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-ink-50 mb-2">
              会员不存在
            </h2>
            <p className="text-ink-400 mb-6">
              未找到对应的会员档案，可能已被删除或链接无效
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回上一页
              </button>
              <button
                onClick={() => navigate('/members')}
                className="btn-primary gap-2"
              >
                <User className="w-4 h-4" />
                返回会员列表
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const avatarColor = member.gender === 'female' ? 'from-pink-500/30 to-purple-500/30' : 'from-orange/30 to-red-500/30';

  return (
    <AppLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/members')}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回会员列表
        </button>

        <div className="card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative flex-shrink-0">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-2xl object-cover border-3 border-ink-600"
                />
              ) : (
                <div
                  className={cn(
                    'w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br border-3 border-ink-600',
                    avatarColor
                  )}
                >
                  <User className="w-12 h-12 text-orange" />
                </div>
              )}
              <div
                className={cn(
                  'absolute -bottom-2 -right-2 px-3 py-1 rounded-xl text-xs font-bold font-heading shadow-industrial',
                  levelBadgeClass[member.level]
                )}
              >
                {MEMBER_LEVEL_LABEL[member.level]}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-heading font-bold text-ink-50 tracking-wide">
                {member.name}
              </h1>
              <p className="text-sm text-ink-400 mt-1">
                {member.gender === 'male' ? '男' : member.gender === 'female' ? '女' : '其他'} · {member.age}岁
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-orange flex-shrink-0" />
                  <span className="text-ink-400">手机号</span>
                  <span className="text-ink-100 font-mono">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-orange flex-shrink-0" />
                  <span className="text-ink-400">入会时间</span>
                  <span className="text-ink-100">
                    {formatDate(parseDate(member.joinDate), 'YYYY-MM-DD')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-orange flex-shrink-0" />
                  <span className="text-ink-400">上次到店</span>
                  <span className="text-ink-100">{lastVisitText}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 lg:flex-shrink-0">
              <button
                className="btn-primary gap-2"
                onClick={() => setBookingModalOpen(true)}
              >
                <CalendarPlus className="w-4 h-4" />
                立即预约
              </button>
              <button className="btn-secondary gap-2">
                <Pencil className="w-4 h-4" />
                编辑会员
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BodyMetricsChart memberId={member.id} />
            <TrainingGoal member={member} />
          </div>

          <div className="space-y-6">
            {memberPackages.length === 0 ? (
              <div className="card p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-ink-700 flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-ink-500" />
                </div>
                <p className="text-ink-300 text-sm">暂无课包</p>
                <p className="text-ink-500 text-xs mt-1">该会员还未购买任何课包</p>
              </div>
            ) : (
              memberPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))
            )}

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-orange" />
                <h3 className="text-lg font-heading font-semibold text-ink-50 tracking-wide">
                  最近课程预约
                </h3>
              </div>

              {recentBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30 text-ink-500" />
                  <p className="text-sm text-ink-400">暂无预约记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => {
                    const coach = getCoachById(booking.coachId);
                    return (
                      <div
                        key={booking.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-ink-700/30 border border-ink-700/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-ink-100">
                              {formatDate(parseDate(booking.date), 'MM-DD')}
                            </span>
                            <span className="text-xs text-ink-400 font-mono">
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ink-400">
                            <User className="w-3 h-3" />
                            <span>{coach?.name || '未知教练'}</span>
                            <span className="text-ink-600">·</span>
                            <span>{SPECIALTY_LABEL[booking.specialty]}</span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'badge text-[10px] flex-shrink-0',
                            bookingStatusBadgeClass[booking.status]
                          )}
                        >
                          {BOOKING_STATUS_LABEL[booking.status]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialMemberId={memberId}
      />
    </AppLayout>
  );
}
