import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Calendar, User, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoachStore } from '@/store/useCoachStore';
import { useBookingStore } from '@/store/useBookingStore';
import { SPECIALTY_LABEL } from '@/types';
import { formatDate, getWeekRange, daysBetween, getWeekdayName } from '@/utils/date';

type RangeType = 'week' | 'month';

interface CoachUtil {
  coachId: string;
  coachName: string;
  utilizationRate: number;
  totalScheduled: number;
  totalCapacity: number;
  freeSlots: number;
}

export default function CoachUtilization() {
  const { coaches, loadCoaches } = useCoachStore();
  const { bookings, loadBookings } = useBookingStore();
  const [rangeType, setRangeType] = useState<RangeType>('week');

  useEffect(() => {
    loadCoaches();
    loadBookings();
  }, [loadCoaches, loadBookings]);

  const rangeData = useMemo(() => {
    const now = new Date();
    if (rangeType === 'week') {
      const { start, end } = getWeekRange(now);
      return {
        start,
        end,
        label: `本周（${formatDate(start, 'MM/DD')} - ${formatDate(end, 'MM/DD')}）`,
        days: 7,
      };
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start,
      end,
      label: `本月（${formatDate(start, 'MM/DD')} - ${formatDate(end, 'MM/DD')}）`,
      days: end.getDate(),
    };
  }, [rangeType]);

  const coachUtils: CoachUtil[] = useMemo(() => {
    return coaches.map((coach) => {
      const startHour = parseInt(coach.workingHours.start.split(':')[0]);
      const endHour = parseInt(coach.workingHours.end.split(':')[0]);
      const hoursPerDay = endHour - startHour;

      let workingDays = rangeData.days;
      for (let i = 0; i < rangeData.days; i++) {
        const date = new Date(rangeData.start);
        date.setDate(date.getDate() + i);
        if (coach.daysOff.includes(date.getDay())) {
          workingDays--;
        }
      }

      const totalCapacity = workingDays * hoursPerDay;

      const relevantBookings = bookings.filter((b) => {
        if (b.coachId !== coach.id) return false;
        if (b.status === 'cancelled' || b.status === 'no_show' || b.status === 'leave') return false;
        const bookingDate = new Date(b.date);
        return bookingDate >= rangeData.start && bookingDate <= rangeData.end;
      });

      let totalScheduled = 0;
      relevantBookings.forEach((b) => {
        const start = parseInt(b.startTime.split(':')[0]);
        const end = parseInt(b.endTime.split(':')[0]);
        totalScheduled += (end - start);
      });

      const utilizationRate = totalCapacity > 0
        ? Math.round((totalScheduled / totalCapacity) * 100)
        : 0;

      const freeSlots = Math.max(0, totalCapacity - totalScheduled);

      return {
        coachId: coach.id,
        coachName: coach.name,
        utilizationRate,
        totalScheduled,
        totalCapacity,
        freeSlots,
      };
    });
  }, [coaches, bookings, rangeData]);

  const chartWidth = 600;
  const chartHeight = 280;
  const padding = { top: 30, right: 20, bottom: 60, left: 50 };
  const chartInnerWidth = chartWidth - padding.left - padding.right;
  const chartInnerHeight = chartHeight - padding.top - padding.bottom;

  const maxRate = 100;

  const barWidth = (chartInnerWidth / coachUtils.length) * 0.6;
  const barGap = (chartInnerWidth / coachUtils.length) * 0.4;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange/20 text-orange">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-heading tracking-wide">教练利用率</h3>
            <p className="text-sm text-ink-400">{rangeData.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-ink-900 rounded-lg border border-ink-700">
          <button
            onClick={() => setRangeType('week')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              rangeType === 'week'
                ? 'bg-orange text-white shadow-glow-orange'
                : 'text-ink-400 hover:text-ink-200'
            )}
          >
            本周
          </button>
          <button
            onClick={() => setRangeType('month')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              rangeType === 'month'
                ? 'bg-orange text-white shadow-glow-orange'
                : 'text-ink-400 hover:text-ink-200'
            )}
          >
            本月
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full max-w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#CC4A1A" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="barGradientLow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8BC34A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#568128" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = padding.top + chartInnerHeight - (tick / maxRate) * chartInnerHeight;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#262626"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#666666"
                  fontSize="11"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {coachUtils.map((util, index) => {
            const barHeight = (util.utilizationRate / maxRate) * chartInnerHeight;
            const x = padding.left + barGap / 2 + index * (barWidth + barGap);
            const y = padding.top + chartInnerHeight - barHeight;
            const isLow = util.utilizationRate < 50;

            return (
              <g key={util.coachId}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isLow ? 'url(#barGradientLow)' : 'url(#barGradient)'}
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill={isLow ? '#8BC34A' : '#FF6B35'}
                  fontSize="12"
                  fontWeight="600"
                >
                  {util.utilizationRate}%
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 18}
                  textAnchor="middle"
                  fill="#CCCCCC"
                  fontSize="12"
                  fontWeight="500"
                >
                  {util.coachName}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 34}
                  textAnchor="middle"
                  fill="#666666"
                  fontSize="10"
                >
                  {util.totalScheduled}/{util.totalCapacity}h
                </text>
              </g>
            );
          })}

          <line
            x1={padding.left}
            y1={padding.top + chartInnerHeight}
            x2={chartWidth - padding.right}
            y2={padding.top + chartInnerHeight}
            stroke="#333333"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {coachUtils.map((util) => {
          const coach = coaches.find((c) => c.id === util.coachId);
          const isLow = util.utilizationRate < 50;
          const isHigh = util.utilizationRate >= 80;

          return (
            <div
              key={util.coachId}
              className="p-4 rounded-xl bg-ink-900/60 border border-ink-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm font-medium">
                    {util.coachName[0]}
                  </div>
                  <div>
                    <div className="font-medium">{util.coachName}</div>
                    <div className="text-xs text-ink-400 truncate max-w-32">
                      {coach?.specialties.slice(0, 2).map((s) => SPECIALTY_LABEL[s]).join('、')}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    isHigh && 'bg-orange/20 text-orange border border-orange/40',
                    !isHigh && !isLow && 'bg-info/20 text-info border border-info/40',
                    isLow && 'bg-lime/20 text-lime border border-lime/40'
                  )}
                >
                  {util.utilizationRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-ink-700 rounded-full overflow-hidden mb-3">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isHigh ? 'bg-gradient-to-r from-orange to-orange-600' :
                    isLow ? 'bg-gradient-to-r from-lime to-lime-600' :
                    'bg-gradient-to-r from-info to-info-600'
                  )}
                  style={{ width: `${util.utilizationRate}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-ink-400 flex items-center gap-1">
                    <Clock size={10} />已排
                  </div>
                  <div className="font-medium text-ink-200 mt-0.5">{util.totalScheduled}h</div>
                </div>
                <div>
                  <div className="text-ink-400 flex items-center gap-1">
                    <Calendar size={10} />容量
                  </div>
                  <div className="font-medium text-ink-200 mt-0.5">{util.totalCapacity}h</div>
                </div>
                <div>
                  <div className="text-ink-400 flex items-center gap-1">
                    <TrendingUp size={10} />空档
                  </div>
                  <div className={cn(
                    'font-medium mt-0.5',
                    isLow ? 'text-lime' : 'text-ink-200'
                  )}>
                    {util.freeSlots}h
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
