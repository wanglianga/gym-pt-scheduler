import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MetricKey } from '@/types';
import { METRIC_META } from '@/types';
import { useMetricStore } from '@/store/useMetricStore';
import {
  calculateChartPoints,
  generateSmoothPath,
  generateAreaPath,
  generateYAxisTicks,
  generateXAxisTicks,
} from '@/utils/chart';

interface BodyMetricsChartProps {
  memberId: string;
  className?: string;
}

const DISPLAY_TABS: MetricKey[] = ['weight', 'bodyFat', 'muscleMass', 'bmi'];

const CHART_WIDTH = 640;
const CHART_HEIGHT = 280;

export default function BodyMetricsChart({ memberId, className }: BodyMetricsChartProps) {
  const [activeTab, setActiveTab] = useState<MetricKey>('weight');

  const loadMetrics = useMetricStore((s) => s.loadMetrics);
  const metrics = useMetricStore((s) => s.metrics);
  const getMetricChartData = useMetricStore((s) => s.getMetricChartData);
  const getMetricSummary = useMetricStore((s) => s.getMetricSummary);

  useEffect(() => {
    if (metrics.length === 0) {
      loadMetrics();
    }
  }, [metrics.length, loadMetrics]);

  const activeMeta = useMemo(
    () => METRIC_META.find((m) => m.key === activeTab)!,
    [activeTab]
  );

  const chartData = useMemo(
    () => getMetricChartData(memberId, activeTab),
    [memberId, activeTab, getMetricChartData]
  );

  const summary = useMemo(
    () => getMetricSummary(memberId, activeTab),
    [memberId, activeTab, getMetricSummary]
  );

  const { points, smoothPath, areaPath, yTicks, xTicks, minVal, maxVal } = useMemo(() => {
    if (chartData.length === 0) {
      return {
        points: [],
        smoothPath: '',
        areaPath: '',
        yTicks: [],
        xTicks: [],
        minVal: 0,
        maxVal: 0,
      };
    }

    const values = chartData.map((d) => d.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const range = rawMax - rawMin || 1;
    const minVal = rawMin - range * 0.15;
    const maxVal = rawMax + range * 0.15;

    const config = {
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      padding: { top: 24, right: 24, bottom: 40, left: 52 },
      minValue: minVal,
      maxValue: maxVal,
    };

    const pts = calculateChartPoints(chartData, config);
    return {
      points: pts,
      smoothPath: generateSmoothPath(pts),
      areaPath: generateAreaPath(pts, config),
      yTicks: generateYAxisTicks({ ...config, minValue: minVal, maxValue: maxVal }, 4),
      xTicks: generateXAxisTicks(pts, config),
      minVal,
      maxVal,
    };
  }, [chartData]);

  const gradientId = `metric-gradient-${activeTab}`;
  const lineId = `metric-line-${activeTab}`;

  const TrendIcon = summary.trend === 'up' ? TrendingUp : summary.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    activeTab === 'bodyFat'
      ? summary.trend === 'down'
        ? 'text-lime'
        : summary.trend === 'up'
        ? 'text-danger'
        : 'text-ink-400'
      : activeTab === 'weight'
      ? summary.trend === 'down'
        ? 'text-lime'
        : summary.trend === 'up'
        ? 'text-orange'
        : 'text-ink-400'
      : summary.trend === 'up'
      ? 'text-lime'
      : summary.trend === 'down'
      ? 'text-danger'
      : 'text-ink-400';

  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange" />
          <h3 className="text-lg font-heading font-semibold text-ink-50 tracking-wide">体测数据趋势</h3>
        </div>
      </div>

      <div className="flex gap-1.5 mb-5 bg-ink-900/50 p-1 rounded-lg w-fit">
        {DISPLAY_TABS.map((key) => {
          const meta = METRIC_META.find((m) => m.key === key)!;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                activeTab === key
                  ? 'bg-orange text-white shadow-glow-orange'
                  : 'text-ink-300 hover:text-ink-100 hover:bg-ink-700/50'
              )}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {chartData.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-ink-400">
          <Activity className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">暂无{activeMeta.label}数据</p>
        </div>
      ) : (
        <>
          <div className="flex items-end gap-6 mb-4">
            <div>
              <p className="text-xs text-ink-400 mb-1">最新{activeMeta.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-heading font-bold text-ink-50">
                  {summary.latest ? summary.latest[activeTab].toFixed(1) : '--'}
                </span>
                <span className="text-sm text-ink-400">{activeMeta.unit}</span>
              </div>
            </div>
            {summary.change !== null && (
              <div className={cn('flex items-center gap-1 text-sm', trendColor)}>
                <TrendIcon className="w-4 h-4" />
                <span className="font-medium">
                  {summary.change > 0 ? '+' : ''}
                  {summary.change.toFixed(1)}
                  {activeMeta.unit}
                </span>
              </div>
            )}
            {activeMeta.goodMin !== undefined && activeMeta.goodMax !== undefined && (
              <div className="text-xs text-ink-400 ml-auto">
                理想范围：
                <span className="text-lime font-medium">
                  {activeMeta.goodMin}-{activeMeta.goodMax}
                  {activeMeta.unit}
                </span>
              </div>
            )}
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF6B35" />
                  <stop offset="100%" stopColor="#FF9E75" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {yTicks.map((tick, i) => (
                <g key={`yt-${i}`}>
                  <line
                    x1={52}
                    x2={CHART_WIDTH - 24}
                    y1={tick.y}
                    y2={tick.y}
                    stroke="#262626"
                    strokeWidth={1}
                    strokeDasharray={i === yTicks.length - 1 ? '0' : '4 4'}
                  />
                  <text
                    x={44}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="#666"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              <path d={areaPath} fill={`url(#${gradientId})`} />

              <path
                d={smoothPath}
                fill="none"
                stroke={`url(#${lineId})`}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {points.map((p, i) => (
                <g key={`pt-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={i === points.length - 1 ? 6 : 4}
                    fill="#0F0F0F"
                    stroke={i === points.length - 1 ? '#FF6B35' : '#FF9E75'}
                    strokeWidth={2}
                  />
                  {i === points.length - 1 && (
                    <circle cx={p.x} cy={p.y} r={10} fill="#FF6B35" opacity="0.2">
                      <animate
                        attributeName="r"
                        values="6;14;6"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.4;0;0.4"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              ))}

              {xTicks.map((tick, i) => {
                const step = Math.ceil(xTicks.length / 6);
                if (i % step !== 0 && i !== xTicks.length - 1) return null;
                return (
                  <text
                    key={`xt-${i}`}
                    x={tick.x}
                    y={CHART_HEIGHT - 16}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="11"
                  >
                    {tick.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
