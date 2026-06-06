import { useMemo, useState } from 'react';
import {
  Package,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Hourglass,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoursePackage, Deduction } from '@/types';
import { SPECIALTY_LABEL, PACKAGE_STATUS_LABEL } from '@/types';
import { deductions as mockDeductions } from '@/data/packages';
import { formatDate, parseDate, daysBetween, isExpired } from '@/utils/date';

interface PackageCardProps {
  pkg: CoursePackage;
  deductions?: Deduction[];
  className?: string;
}

export default function PackageCard({ pkg, deductions, className }: PackageCardProps) {
  const [showTimeline, setShowTimeline] = useState(false);

  const packageDeductions = useMemo(() => {
    const source = deductions || mockDeductions;
    return source
      .filter((d) => d.packageId === pkg.id)
      .sort((a, b) => new Date(b.deductedAt).getTime() - new Date(a.deductedAt).getTime());
  }, [pkg.id, deductions]);

  const remaining = pkg.totalSessions - pkg.usedSessions;
  const progress = (remaining / pkg.totalSessions) * 100;
  const usedProgress = (pkg.usedSessions / pkg.totalSessions) * 100;

  const daysLeft = useMemo(() => {
    if (pkg.status === 'depleted') return null;
    return daysBetween(new Date(), pkg.expireDate);
  }, [pkg.expireDate, pkg.status]);

  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
  const isLowBalance = remaining > 0 && remaining <= 5;

  const statusBadgeClass = {
    active: 'bg-lime/20 text-lime border border-lime/40',
    expired: 'bg-danger/20 text-danger border border-danger/40',
    depleted: 'bg-ink-600 text-ink-300 border border-ink-500',
  }[pkg.status];

  const progressColor =
    pkg.status === 'active'
      ? isLowBalance
        ? 'from-danger to-danger-600'
        : isExpiring
        ? 'from-yellow-500 to-orange'
        : 'from-orange to-orange-500'
      : 'from-ink-500 to-ink-600';

  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange/30 to-orange-600/30 flex items-center justify-center flex-shrink-0 border border-orange/30">
              <Package className="w-5.5 h-5.5 text-orange" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-semibold text-ink-50 tracking-wide truncate">
                {pkg.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="badge badge-info text-[11px]">
                  {SPECIALTY_LABEL[pkg.specialty]}
                </span>
                <span className={cn('badge text-[11px]', statusBadgeClass)}>
                  {PACKAGE_STATUS_LABEL[pkg.status]}
                </span>
                {isLowBalance && pkg.status === 'active' && (
                  <span className="badge badge-danger text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    余额不足
                  </span>
                )}
                {isExpiring && pkg.status === 'active' && (
                  <span className="badge badge-orange text-[11px] flex items-center gap-1">
                    <Hourglass className="w-3 h-3" />
                    即将到期
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-ink-400">剩余课时</div>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-3xl font-heading font-bold text-orange">{remaining}</span>
              <span className="text-sm text-ink-400">/ {pkg.totalSessions}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-ink-400 mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              已消耗 {pkg.usedSessions} 节
            </span>
            <span>{progress.toFixed(0)}% 剩余</span>
          </div>
          <div className="relative h-2.5 bg-ink-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute left-0 top-0 h-full bg-gradient-to-r rounded-full transition-all duration-500',
                progressColor
              )}
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute left-0 top-0 h-full bg-ink-600/50 rounded-full"
              style={{ width: `${usedProgress}%`, zIndex: -1 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-ink-300">
            <Layers className="w-4 h-4 text-orange flex-shrink-0" />
            <span className="text-ink-400">已消耗</span>
            <span className="text-ink-100 font-medium">{pkg.usedSessions} 节</span>
          </div>
          <div className="flex items-center gap-2 text-ink-300">
            <Clock className="w-4 h-4 text-orange flex-shrink-0" />
            <span className="text-ink-400">剩余</span>
            <span className="text-ink-100 font-medium">{remaining} 节</span>
          </div>
          <div className="flex items-center gap-2 text-ink-300 col-span-2">
            <Calendar className="w-4 h-4 text-orange flex-shrink-0" />
            <span className="text-ink-400">有效期</span>
            <span className="text-ink-100 font-medium">
              {formatDate(parseDate(pkg.purchaseDate), 'YYYY-MM-DD')}
              <span className="text-ink-500 mx-1">~</span>
              {formatDate(parseDate(pkg.expireDate), 'YYYY-MM-DD')}
            </span>
            {daysLeft !== null && pkg.status === 'active' && (
              <span
                className={cn(
                  'ml-auto text-xs font-medium',
                  daysLeft < 0 ? 'text-danger' : isExpiring ? 'text-orange' : 'text-lime'
                )}
              >
                {daysLeft < 0
                  ? `已过期 ${Math.abs(daysLeft)} 天`
                  : daysLeft === 0
                  ? '今天到期'
                  : `还剩 ${daysLeft} 天`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-700">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full flex items-center justify-between gap-2 px-5 py-3 text-sm text-ink-300 hover:text-ink-100 hover:bg-ink-700/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange" />
            扣减记录
            <span className="badge bg-ink-700 text-ink-300 border border-ink-600 text-[10px]">
              {packageDeductions.length}
            </span>
          </span>
          {showTimeline ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showTimeline && (
          <div className="px-5 pb-5 animate-slide-down">
            {packageDeductions.length === 0 ? (
              <div className="py-6 text-center text-sm text-ink-400">
                暂无扣减记录
              </div>
            ) : (
              <div className="relative pl-5">
                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-orange/50 via-ink-600 to-transparent" />
                <div className="space-y-4">
                  {packageDeductions.slice(0, 5).map((d, idx) => (
                    <div key={d.id} className="relative">
                      <div
                        className={cn(
                          'absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-ink-800',
                          idx === 0 ? 'bg-orange shadow-glow-orange' : 'bg-ink-500'
                        )}
                      />
                      <div className="bg-ink-700/30 rounded-lg p-3 border border-ink-700/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-ink-100 font-medium">{d.reason}</p>
                            <p className="text-xs text-ink-400 mt-0.5">
                              {formatDate(parseDate(d.deductedAt), 'YYYY-MM-DD HH:mm')}
                              {d.operatorName && ` · ${d.operatorName}`}
                            </p>
                          </div>
                          <span className="badge badge-danger text-[11px] flex-shrink-0">
                            -{d.sessions} 节
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {packageDeductions.length > 5 && (
                    <div className="text-xs text-ink-500 text-center pt-1">
                      还有 {packageDeductions.length - 5} 条记录
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
