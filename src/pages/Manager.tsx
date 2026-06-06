import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/dashboard/StatCard';
import CoachUtilization from '@/components/manager/CoachUtilization';
import PackageConsumption from '@/components/manager/PackageConsumption';
import RiskAlertList from '@/components/manager/RiskAlertList';
import { useMemberStore } from '@/store/useMemberStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePackageStore } from '@/store/usePackageStore';
import { getWeekRange, formatDate, addDays } from '@/utils/date';
import {
  Users,
  CalendarCheck,
  Wallet,
  AlertTriangle,
  Download,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RangeType = 'week' | 'month' | 'quarter';

const RANGE_OPTIONS: Array<{ value: RangeType; label: string }> = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
];

function getDateRange(rangeType: RangeType) {
  const now = new Date();
  if (rangeType === 'week') {
    const { start, end } = getWeekRange(now);
    return { start, end, label: `本周（${formatDate(start, 'MM/DD')} - ${formatDate(end, 'MM/DD')}）` };
  }
  if (rangeType === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end, label: `本月（${formatDate(start, 'MM/DD')} - ${formatDate(end, 'MM/DD')}）` };
  }
  const quarter = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), quarter * 3, 1);
  const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
  return { start, end, label: `本季度（${formatDate(start, 'MM/DD')} - ${formatDate(end, 'MM/DD')}）` };
}

export default function Manager() {
  const { members } = useMemberStore();
  const { bookings } = useBookingStore();
  const { packages } = usePackageStore();
  const [rangeType, setRangeType] = useState<RangeType>('week');
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

  const dateRange = useMemo(() => getDateRange(rangeType), [rangeType]);

  const stats = useMemo(() => {
    const totalMembers = members.length;

    const rangeBookings = bookings.filter((b) => {
      if (b.status !== 'completed' && b.status !== 'no_show') return false;
      const bookingDate = new Date(b.date);
      return bookingDate >= dateRange.start && bookingDate <= dateRange.end;
    });

    const consumedSessions = rangeBookings.reduce((sum, b) => {
      const start = parseInt(b.startTime.split(':')[0]);
      const end = parseInt(b.endTime.split(':')[0]);
      return sum + Math.max(1, end - start);
    }, 0);

    const weekRange = getWeekRange(new Date());
    const weekBookings = bookings.filter((b) => {
      if (b.status !== 'completed' && b.status !== 'no_show') return false;
      const bookingDate = new Date(b.date);
      return bookingDate >= weekRange.start && bookingDate <= weekRange.end;
    });
    const weekConsumed = weekBookings.reduce((sum, b) => {
      const start = parseInt(b.startTime.split(':')[0]);
      const end = parseInt(b.endTime.split(':')[0]);
      return sum + Math.max(1, end - start);
    }, 0);

    const rangePackages = packages.filter((p) => {
      const purchaseDate = new Date(p.purchaseDate);
      return purchaseDate >= dateRange.start && purchaseDate <= dateRange.end;
    });
    const packageRevenue = rangePackages.reduce((sum, p) => sum + p.price, 0);

    const now = new Date();
    let riskCount = 0;
    members.forEach((member) => {
      const memberBookings = bookings.filter((b) => b.memberId === member.id);
      const completedBookings = memberBookings.filter((b) => b.status === 'completed');

      let lastVisitDate: Date | null = null;
      completedBookings.forEach((b) => {
        const d = new Date(b.date);
        if (!lastVisitDate || d > lastVisitDate) {
          lastVisitDate = d;
        }
      });

      const daysSinceLastVisit = lastVisitDate
        ? Math.round((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const memberPackages = packages.filter(
        (p) => p.memberId === member.id && p.status === 'active'
      );
      const remainingSessions = memberPackages.reduce(
        (sum, p) => sum + (p.totalSessions - p.usedSessions),
        0
      );

      const leaveCount = memberBookings.filter((b) => b.status === 'leave').length;

      let isRisk = false;
      if (!lastVisitDate || daysSinceLastVisit >= 14) isRisk = true;
      if (remainingSessions >= 20) isRisk = true;
      if (leaveCount >= 3) isRisk = true;

      if (isRisk) riskCount++;
    });

    return {
      totalMembers,
      weekConsumed,
      packageRevenue,
      riskCount,
    };
  }, [members, bookings, packages, dateRange]);

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      range: {
        type: rangeType,
        start: formatDate(dateRange.start),
        end: formatDate(dateRange.end),
      },
      stats,
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        level: m.level,
        joinDate: m.joinDate,
      })),
      bookings: bookings.map((b) => ({
        id: b.id,
        memberId: b.memberId,
        coachId: b.coachId,
        date: b.date,
        status: b.status,
      })),
      packages: packages.map((p) => ({
        id: p.id,
        memberId: p.memberId,
        name: p.name,
        price: p.price,
        purchaseDate: p.purchaseDate,
        totalSessions: p.totalSessions,
        usedSessions: p.usedSessions,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpro-report-${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout initialRole="manager">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading tracking-wide text-ink-50">店长看板</h1>
            <p className="text-sm text-ink-400 mt-1">{dateRange.label} 经营数据概览</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200',
                  rangeDropdownOpen
                    ? 'bg-ink-800 border-orange text-orange'
                    : 'bg-ink-800 border-ink-700 text-ink-200 hover:border-ink-600'
                )}
              >
                <CalendarCheck size={18} />
                <span className="text-sm font-medium">
                  {RANGE_OPTIONS.find((o) => o.value === rangeType)?.label}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'transition-transform duration-200',
                    rangeDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {rangeDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 animate-scale-in origin-top-right z-50">
                  <div className="py-1.5 bg-ink-800 border border-ink-700 rounded-xl shadow-industrial">
                    {RANGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setRangeType(opt.value);
                          setRangeDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                          rangeType === opt.value
                            ? 'text-orange bg-orange/10 border-l-2 border-orange'
                            : 'text-ink-200 hover:bg-ink-700/50 border-l-2 border-transparent'
                        )}
                      >
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange text-white font-medium shadow-glow-orange hover:bg-orange-600 transition-colors"
            >
              <Download size={18} />
              <span className="text-sm">数据导出</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总会员数"
            value={stats.totalMembers}
            icon={Users}
            change={8}
            changeLabel="较上月"
            unit="人"
            iconBg="bg-orange/15"
            iconColor="text-orange"
          />
          <StatCard
            title="本周消课数"
            value={stats.weekConsumed}
            icon={CalendarCheck}
            change={15}
            changeLabel="较上周"
            unit="课时"
            iconBg="bg-lime/15"
            iconColor="text-lime"
          />
          <StatCard
            title="课包收入"
            value={`¥${(stats.packageRevenue / 10000).toFixed(1)}`}
            icon={Wallet}
            change={12}
            changeLabel="较上期"
            unit="万"
            iconBg="bg-info/15"
            iconColor="text-info"
          />
          <StatCard
            title="退课风险数"
            value={stats.riskCount}
            icon={AlertTriangle}
            change={-5}
            changeLabel="较上月"
            unit="人"
            iconBg="bg-danger/15"
            iconColor="text-danger"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CoachUtilization />
          <PackageConsumption />
        </div>

        <RiskAlertList />
      </div>
    </AppLayout>
  );
}
