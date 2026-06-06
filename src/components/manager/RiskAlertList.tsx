import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, User, Calendar, Clock, Phone, ChevronRight, AlertCircle, UserX, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberStore } from '@/store/useMemberStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePackageStore } from '@/store/usePackageStore';
import { MEMBER_LEVEL_LABEL } from '@/types';
import { formatDate, daysBetween } from '@/utils/date';

type RiskType = 'no_show' | 'high_balance' | 'frequent_leave';

interface RiskMember {
  memberId: string;
  memberName: string;
  phone: string;
  level: string;
  riskTypes: RiskType[];
  lastVisitDate: string | null;
  daysSinceLastVisit: number;
  remainingSessions: number;
  leaveCount: number;
  riskScore: number;
}

const RISK_LABELS: Record<RiskType, { label: string; color: string; bg: string; border: string }> = {
  no_show: {
    label: '长期未到店',
    color: 'text-danger',
    bg: 'bg-danger/20',
    border: 'border-danger/40',
  },
  high_balance: {
    label: '剩余课时多',
    color: 'text-orange',
    bg: 'bg-orange/20',
    border: 'border-orange/40',
  },
  frequent_leave: {
    label: '频繁请假',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/40',
  },
};

export default function RiskAlertList() {
  const { members, loadMembers } = useMemberStore();
  const { bookings, loadBookings } = useBookingStore();
  const { packages, loadPackages } = usePackageStore();
  const [filterType, setFilterType] = useState<RiskType | 'all'>('all');

  useEffect(() => {
    loadMembers();
    loadBookings();
    loadPackages();
  }, [loadMembers, loadBookings, loadPackages]);

  const riskMembers: RiskMember[] = useMemo(() => {
    const now = new Date();
    const result: RiskMember[] = [];

    members.forEach((member) => {
      const memberBookings = bookings.filter((b) => b.memberId === member.id);

      const completedBookings = memberBookings.filter(
        (b) => b.status === 'completed'
      );

      let lastVisitDate: Date | null = null;
      completedBookings.forEach((b) => {
        const d = new Date(b.date);
        if (!lastVisitDate || d > lastVisitDate) {
          lastVisitDate = d;
        }
      });

      const daysSinceLastVisit = lastVisitDate
        ? daysBetween(lastVisitDate, now)
        : 999;

      const activePackages = packages.filter(
        (p) => p.memberId === member.id && p.status === 'active'
      );
      const remainingSessions = activePackages.reduce(
        (sum, p) => sum + (p.totalSessions - p.usedSessions),
        0
      );

      const leaveCount = memberBookings.filter(
        (b) => b.status === 'leave'
      ).length;

      const riskTypes: RiskType[] = [];
      let riskScore = 0;

      if (!lastVisitDate || daysSinceLastVisit >= 14) {
        riskTypes.push('no_show');
        riskScore += daysSinceLastVisit >= 30 ? 3 : 2;
      }

      if (remainingSessions >= 20) {
        riskTypes.push('high_balance');
        riskScore += remainingSessions >= 40 ? 3 : 2;
      }

      if (leaveCount >= 3) {
        riskTypes.push('frequent_leave');
        riskScore += leaveCount >= 5 ? 3 : 2;
      }

      if (riskTypes.length > 0) {
        result.push({
          memberId: member.id,
          memberName: member.name,
          phone: member.phone,
          level: member.level,
          riskTypes,
          lastVisitDate: lastVisitDate ? formatDate(lastVisitDate) : null,
          daysSinceLastVisit,
          remainingSessions,
          leaveCount,
          riskScore,
        });
      }
    });

    return result.sort((a, b) => b.riskScore - a.riskScore);
  }, [members, bookings, packages]);

  const filteredMembers = useMemo(() => {
    if (filterType === 'all') return riskMembers;
    return riskMembers.filter((m) => m.riskTypes.includes(filterType));
  }, [riskMembers, filterType]);

  const riskCounts = useMemo(() => {
    return {
      all: riskMembers.length,
      no_show: riskMembers.filter((m) => m.riskTypes.includes('no_show')).length,
      high_balance: riskMembers.filter((m) => m.riskTypes.includes('high_balance')).length,
      frequent_leave: riskMembers.filter((m) => m.riskTypes.includes('frequent_leave')).length,
    };
  }, [riskMembers]);

  const filterOptions: Array<{ value: RiskType | 'all'; label: string; count: number }> = [
    { value: 'all', label: '全部', count: riskCounts.all },
    { value: 'no_show', label: '长期未到店', count: riskCounts.no_show },
    { value: 'high_balance', label: '剩余课时多', count: riskCounts.high_balance },
    { value: 'frequent_leave', label: '频繁请假', count: riskCounts.frequent_leave },
  ];

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-danger/20 text-danger animate-pulse-slow">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-heading tracking-wide">高风险退课预警</h3>
            <p className="text-sm text-ink-400">
              共 {riskMembers.length} 位会员存在退课风险
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterType(opt.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
              filterType === opt.value
                ? 'bg-danger/20 text-danger border-danger/50'
                : 'bg-ink-900 text-ink-300 border-ink-700 hover:border-ink-600'
            )}
          >
            {opt.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-xs',
              filterType === opt.value
                ? 'bg-danger/30 text-danger'
                : 'bg-ink-700 text-ink-400'
            )}>
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-ink-400">
            <UserX size={40} className="mb-3 opacity-50" />
            <p className="text-sm">暂无高风险会员</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.memberId}
              className="p-4 rounded-xl bg-ink-900/60 border border-danger/20 hover:border-danger/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-ink-700 flex items-center justify-center font-medium text-base">
                      {member.memberName[0]}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger flex items-center justify-center">
                      <AlertCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-ink-100">{member.memberName}</h4>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        member.level === 'diamond' && 'bg-orange/20 text-orange border border-orange/40',
                        member.level === 'platinum' && 'bg-lime/20 text-lime border border-lime/40',
                        member.level === 'gold' && 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40',
                        member.level === 'silver' && 'bg-ink-400/20 text-ink-300 border border-ink-400/40',
                        member.level === 'basic' && 'bg-ink-500/20 text-ink-400 border border-ink-500/40',
                      )}>
                        {MEMBER_LEVEL_LABEL[member.level as keyof typeof MEMBER_LEVEL_LABEL]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {member.riskTypes.map((type) => (
                        <span
                          key={type}
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            RISK_LABELS[type].bg,
                            RISK_LABELS[type].color,
                            RISK_LABELS[type].border
                          )}
                        >
                          <AlertTriangle size={10} className="mr-1" />
                          {RISK_LABELS[type].label}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-ink-500 flex items-center gap-1">
                          <Calendar size={10} /> 上次到店
                        </div>
                        <div className="text-ink-200 font-medium">
                          {member.lastVisitDate || '从未到店'}
                          {member.daysSinceLastVisit >= 14 && (
                            <span className="ml-1 text-danger">
                              ({member.daysSinceLastVisit >= 999 ? '—' : `${member.daysSinceLastVisit}天前`})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-ink-500 flex items-center gap-1">
                          <Clock size={10} /> 剩余课时
                        </div>
                        <div className={cn(
                          'font-medium',
                          member.remainingSessions >= 40 ? 'text-danger' :
                          member.remainingSessions >= 20 ? 'text-orange' : 'text-ink-200'
                        )}>
                          {member.remainingSessions} 节
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-ink-500 flex items-center gap-1">
                          <History size={10} /> 请假次数
                        </div>
                        <div className={cn(
                          'font-medium',
                          member.leaveCount >= 5 ? 'text-danger' :
                          member.leaveCount >= 3 ? 'text-orange' : 'text-ink-200'
                        )}>
                          {member.leaveCount} 次
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${member.phone}`}
                    className="p-2 rounded-lg bg-lime/20 text-lime hover:bg-lime/30 transition-colors"
                    title="电话联系"
                  >
                    <Phone size={16} />
                  </a>
                  <button
                    className="p-2 rounded-lg bg-ink-800 text-ink-400 hover:text-orange hover:bg-ink-700 transition-colors group-hover:translate-x-0.5"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {member.riskScore >= 6 && (
                <div className="mt-3 pt-3 border-t border-ink-700 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-danger">
                    高风险会员，建议尽快联系跟进，了解会员训练状态和需求变化
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-ink-700 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-heading text-danger">{riskCounts.no_show}</div>
          <div className="text-xs text-ink-400 flex items-center justify-center gap-1 mt-0.5">
            <UserX size={10} /> 长期未到店
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-heading text-orange">{riskCounts.high_balance}</div>
          <div className="text-xs text-ink-400 flex items-center justify-center gap-1 mt-0.5">
            <Clock size={10} /> 剩余课时多
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-heading text-yellow-500">{riskCounts.frequent_leave}</div>
          <div className="text-xs text-ink-400 flex items-center justify-center gap-1 mt-0.5">
            <History size={10} /> 频繁请假
          </div>
        </div>
      </div>
    </div>
  );
}
