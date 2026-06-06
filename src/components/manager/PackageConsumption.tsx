import { useState, useEffect, useMemo } from 'react';
import { TrendingDown, TrendingUp, Calendar, Package, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePackageStore } from '@/store/usePackageStore';
import { useBookingStore } from '@/store/useBookingStore';
import {
  calculateChartPoints,
  generateSmoothPath,
  generateAreaPath,
  generateYAxisTicks,
  generateXAxisTicks,
} from '@/utils/chart';
import { formatDate, addDays, getWeekRange } from '@/utils/date';

type TrendRange = '4weeks' | '8weeks';

export default function PackageConsumption() {
  const { packages, loadPackages } = usePackageStore();
  const { bookings, loadBookings } = useBookingStore();
  const [rangeType, setRangeType] = useState<TrendRange>('4weeks');

  useEffect(() => {
    loadPackages();
    loadBookings();
  }, [loadPackages, loadBookings]);

  const weekData = useMemo(() => {
    const weeksCount = rangeType === '4weeks' ? 4 : 8;
    const weeks: Array<{
      label: string;
      startDate: Date;
      endDate: Date;
      consumed: number;
      newPurchases: number;
    }> = [];

    const now = new Date();
    const { start: weekStart } = getWeekRange(now);

    for (let i = weeksCount - 1; i >= 0; i--) {
      const start = addDays(weekStart, -i * 7);
      const end = addDays(start, 6);
      end.setHours(23, 59, 59, 999);

      const weekBookings = bookings.filter((b) => {
        if (b.status === 'cancelled' || b.status === 'leave') return false;
        const bookingDate = new Date(b.date);
        return bookingDate >= start && bookingDate <= end;
      });

      const weekPackages = packages.filter((p) => {
        const purchaseDate = new Date(p.purchaseDate);
        return purchaseDate >= start && purchaseDate <= end;
      });

      let consumed = 0;
      weekBookings.forEach((b) => {
        const start = parseInt(b.startTime.split(':')[0]);
        const end = parseInt(b.endTime.split(':')[0]);
        consumed += Math.max(1, end - start);
      });

      const newPurchases = weekPackages.reduce((sum, p) => sum + p.totalSessions, 0);

      weeks.push({
        label: `${formatDate(start, 'MM/DD')}`,
        startDate: start,
        endDate: end,
        consumed,
        newPurchases,
      });
    }

    return weeks;
  }, [rangeType, bookings, packages]);

  const chartData = useMemo(() => {
    return weekData.map((w) => ({
      label: w.label,
      value: w.consumed,
    }));
  }, [weekData]);

  const totalConsumed = weekData.reduce((sum, w) => sum + w.consumed, 0);
  const totalPurchased = weekData.reduce((sum, w) => sum + w.newPurchases, 0);
  const avgPerWeek = Math.round(totalConsumed / weekData.length);

  const chartWidth = 700;
  const chartHeight = 300;
  const padding = { top: 30, right: 30, bottom: 50, left: 50 };

  const maxValue = Math.max(...chartData.map((d) => d.value), 10);
  const config = {
    width: chartWidth,
    height: chartHeight,
    padding,
    minValue: 0,
    maxValue: Math.ceil(maxValue / 5) * 5,
  };

  const points = calculateChartPoints(chartData, config);
  const linePath = generateSmoothPath(points);
  const areaPath = generateAreaPath(points, config);
  const yTicks = generateYAxisTicks(config, 4);
  const xTicks = generateXAxisTicks(points, config);

  const prevWeekConsumed = weekData.length >= 2 ? weekData[weekData.length - 2].consumed : 0;
  const currentWeekConsumed = weekData.length > 0 ? weekData[weekData.length - 1].consumed : 0;
  const weekDiff = currentWeekConsumed - prevWeekConsumed;
  const weekTrend = prevWeekConsumed === 0 ? 'stable' : weekDiff > 0 ? 'up' : weekDiff < 0 ? 'down' : 'stable';

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-lime/20 text-lime">
            <TrendingDown size={20} />
          </div>
          <div>
            <h3 className="text-lg font-heading tracking-wide">课包消耗趋势</h3>
            <p className="text-sm text-ink-400">
              近 {rangeType === '4weeks' ? '4' : '8'} 周课程消耗情况
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-ink-900 rounded-lg border border-ink-700">
          <button
            onClick={() => setRangeType('4weeks')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              rangeType === '4weeks'
                ? 'bg-lime text-ink-900 shadow-glow-lime'
                : 'text-ink-400 hover:text-ink-200'
            )}
          >
            近4周
          </button>
          <button
            onClick={() => setRangeType('8weeks')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              rangeType === '8weeks'
                ? 'bg-lime text-ink-900 shadow-glow-lime'
                : 'text-ink-400 hover:text-ink-200'
            )}
          >
            近8周
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="p-4 rounded-xl bg-ink-900/60 border border-ink-700">
          <div className="text-xs text-ink-400 mb-1 flex items-center gap-1">
            <TrendingDown size={12} /> 累计消耗
          </div>
          <div className="text-2xl font-heading text-orange">{totalConsumed}</div>
          <div className="text-xs text-ink-400 mt-0.5">课时</div>
        </div>
        <div className="p-4 rounded-xl bg-ink-900/60 border border-ink-700">
          <div className="text-xs text-ink-400 mb-1 flex items-center gap-1">
            <Package size={12} /> 新增购买
          </div>
          <div className="text-2xl font-heading text-lime">{totalPurchased}</div>
          <div className="text-xs text-ink-400 mt-0.5">课时</div>
        </div>
        <div className="p-4 rounded-xl bg-ink-900/60 border border-ink-700">
          <div className="text-xs text-ink-400 mb-1 flex items-center gap-1">
            <Calendar size={12} /> 本周消耗
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-heading text-info">{currentWeekConsumed}</div>
            {weekTrend !== 'stable' && prevWeekConsumed > 0 && (
              <div className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                weekTrend === 'up' ? 'text-orange' : 'text-lime'
              )}>
                {weekTrend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(weekDiff)}
              </div>
            )}
            {weekTrend === 'stable' && prevWeekConsumed > 0 && (
              <div className="flex items-center gap-0.5 text-xs font-medium text-ink-400">
                <Minus size={12} /> 持平
              </div>
            )}
          </div>
          <div className="text-xs text-ink-400 mt-0.5">平均 {avgPerWeek} 课时/周</div>
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
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8BC34A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8BC34A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="50%" stopColor="#8BC34A" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={chartWidth - padding.right}
                y2={tick.y}
                stroke="#262626"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fill="#666666"
                fontSize="11"
              >
                {tick.label}
              </text>
            </g>
          ))}

          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#0F0F0F"
                stroke="#8BC34A"
                strokeWidth="2"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#8BC34A"
              />
              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                fill="#CCCCCC"
                fontSize="11"
                fontWeight="500"
              >
                {point.value}
              </text>
            </g>
          ))}

          {xTicks.map((tick, index) => (
            <text
              key={index}
              x={tick.x}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              fill="#666666"
              fontSize="11"
            >
              {tick.label}
            </text>
          ))}

          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#333333"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-lime" />
          <span className="text-ink-400">周消耗课时</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-orange via-lime to-info rounded" />
          <span className="text-ink-400">消耗趋势线</span>
        </div>
      </div>
    </div>
  );
}
