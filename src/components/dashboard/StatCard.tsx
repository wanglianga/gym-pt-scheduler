import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  unit?: string;
  iconBg?: string;
  iconColor?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = '同比',
  unit,
  iconBg = 'bg-orange/15',
  iconColor = 'text-orange',
  onClick,
}: StatCardProps) {
  const trend = change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'stable';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up' ? 'text-lime' : trend === 'down' ? 'text-danger' : 'text-ink-400';
  const trendBg =
    trend === 'up'
      ? 'bg-lime/10'
      : trend === 'down'
      ? 'bg-danger/10'
      : 'bg-ink-700';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-ink-700 bg-ink-800 p-5 shadow-industrial transition-all duration-300',
        onClick && 'cursor-pointer hover:border-orange hover:shadow-glow-orange'
      )}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-3xl font-bold tracking-tight text-ink-50">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-ink-400">{unit}</span>}
          </div>

          {typeof change !== 'undefined' && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                  trendBg,
                  trendColor
                )}
              >
                <TrendIcon className="h-3 w-3" />
                <span>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              </div>
              <span className="text-xs text-ink-500">{changeLabel}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            iconBg
          )}
        >
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}
