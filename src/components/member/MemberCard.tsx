import { useMemo } from 'react';
import { User, Phone, CalendarClock, CalendarPlus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member } from '@/types';
import { MEMBER_LEVEL_LABEL } from '@/types';
import { useBookingStore } from '@/store/useBookingStore';
import { formatDate, parseDate, daysBetween } from '@/utils/date';

interface MemberCardProps {
  member: Member;
  onBook?: (member: Member) => void;
  onViewDetail?: (member: Member) => void;
  className?: string;
}

const levelBadgeClass: Record<string, string> = {
  basic: 'bg-ink-600 text-ink-200 border border-ink-500',
  silver: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
  gold: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  platinum: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
  diamond: 'bg-orange/20 text-orange border border-orange/40',
};

const levelInitials: Record<string, string> = {
  basic: '普',
  silver: '银',
  gold: '金',
  platinum: '铂',
  diamond: '钻',
};

export default function MemberCard({ member, onBook, onViewDetail, className }: MemberCardProps) {
  const getBookingsByMember = useBookingStore((s) => s.getBookingsByMember);

  const lastVisit = useMemo(() => {
    const bookings = getBookingsByMember(member.id)
      .filter((b) => b.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return bookings.length > 0 ? bookings[0].date : null;
  }, [member.id, getBookingsByMember]);

  const lastVisitText = useMemo(() => {
    if (!lastVisit) return '暂无到店记录';
    const days = daysBetween(parseDate(lastVisit), new Date());
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return formatDate(parseDate(lastVisit), 'MM-DD');
  }, [lastVisit]);

  const avatarColor = member.gender === 'female' ? 'from-pink-500/30 to-purple-500/30' : 'from-orange/30 to-red-500/30';

  return (
    <div className={cn('card p-5 hover:border-orange/60 transition-all duration-300', className)}>
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-ink-600"
            />
          ) : (
            <div
              className={cn(
                'w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br border-2 border-ink-600',
                avatarColor
              )}
            >
              <User className="w-8 h-8 text-orange" />
            </div>
          )}
          <div
            className={cn(
              'absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold font-heading shadow-industrial',
              levelBadgeClass[member.level]
            )}
          >
            {levelInitials[member.level]}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-lg font-heading font-semibold text-ink-50 tracking-wide">
                {member.name}
              </h3>
              <span className={cn('badge text-[11px] mt-0.5', levelBadgeClass[member.level])}>
                {MEMBER_LEVEL_LABEL[member.level]}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-ink-300">
              <Phone className="w-3.5 h-3.5 text-orange" />
              <span className="font-mono">{member.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-300">
              <CalendarClock className="w-3.5 h-3.5 text-orange" />
              <span>上次到店：<span className="text-ink-100">{lastVisitText}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => onBook?.(member)}
          className="btn-primary flex-1 text-sm py-2 gap-1.5"
        >
          <CalendarPlus className="w-4 h-4" />
          预约
        </button>
        <button
          onClick={() => onViewDetail?.(member)}
          className="btn-secondary flex-1 text-sm py-2 gap-1.5"
        >
          查看详情
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
