import { Clock, CheckCircle, AlertCircle, XCircle, CalendarX, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';
import { BOOKING_STATUS_LABEL, SPECIALTY_LABEL } from '@/types';
import { formatTime } from '@/utils/date';

interface CalendarSlotProps {
  booking?: Booking;
  time: string;
  date: string;
  onEmptyClick?: (date: string, time: string) => void;
  onBookingClick?: (booking: Booking) => void;
  rowSpan?: number;
  isStartSlot?: boolean;
}

const STATUS_STYLES: Record<BookingStatus, { bg: string; border: string; text: string; accent: string; icon: typeof Clock }> = {
  confirmed: {
    bg: 'bg-lime/15',
    border: 'border-lime/50',
    text: 'text-lime',
    accent: 'bg-lime',
    icon: CheckCircle,
  },
  scheduled: {
    bg: 'bg-orange/15',
    border: 'border-orange/50',
    text: 'text-orange',
    accent: 'bg-orange',
    icon: Clock,
  },
  completed: {
    bg: 'bg-ink-600/50',
    border: 'border-ink-500',
    text: 'text-ink-300',
    accent: 'bg-ink-400',
    icon: CheckCircle,
  },
  cancelled: {
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    text: 'text-danger',
    accent: 'bg-danger',
    icon: XCircle,
  },
  no_show: {
    bg: 'bg-danger/15',
    border: 'border-danger/40',
    text: 'text-danger',
    accent: 'bg-danger',
    icon: AlertCircle,
  },
  leave: {
    bg: 'bg-info/15',
    border: 'border-info/50',
    text: 'text-info',
    accent: 'bg-info',
    icon: CalendarX,
  },
};

export default function CalendarSlot({
  booking,
  time,
  date,
  onEmptyClick,
  onBookingClick,
  rowSpan = 1,
  isStartSlot = true,
}: CalendarSlotProps) {
  if (!booking) {
    return (
      <button
        onClick={() => onEmptyClick?.(date, time)}
        className={cn(
          'h-full w-full border-l border-ink-700/50 transition-all duration-200',
          'hover:bg-orange/10 hover:shadow-glow-orange active:bg-orange/20'
        )}
        aria-label={`${date} ${time} 可预约`}
      >
        <span className="sr-only">创建预约</span>
      </button>
    );
  }

  if (!isStartSlot) {
    return <div className="h-full w-full border-l border-ink-700/50" />;
  }

  const style = STATUS_STYLES[booking.status];
  const StatusIcon = style.icon;
  const isClickable = booking.status !== 'completed' && booking.status !== 'cancelled';

  return (
    <div
      style={{ gridRow: `span ${rowSpan} / span ${rowSpan}` }}
      className="p-1"
    >
      <button
        onClick={() => isClickable && onBookingClick?.(booking)}
        className={cn(
          'group relative flex h-full w-full flex-col justify-start overflow-hidden rounded-lg border p-2 text-left transition-all duration-200',
          style.bg,
          style.border,
          isClickable && 'hover:shadow-glow-orange hover:border-orange active:scale-[0.98]'
        )}
        disabled={!isClickable}
      >
        <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: undefined }}>
          <div className={cn('h-full w-full', style.accent)} />
        </div>

        <div className="flex items-start justify-between gap-1 pl-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1">
              <StatusIcon className={cn('h-3 w-3 flex-shrink-0', style.text)} />
              <span className={cn('text-[10px] font-semibold uppercase tracking-wide', style.text)}>
                {BOOKING_STATUS_LABEL[booking.status]}
              </span>
              {booking.adjustmentNote && (
                <span
                  className="inline-flex items-center gap-0.5 text-[9px] px-1 rounded bg-yellow-500/20 text-yellow-500"
                  title="有训练调整说明"
                >
                  <FileWarning size={9} />
                  调整
                </span>
              )}
            </div>
            <span className={cn('mt-0.5 truncate text-xs font-medium', 'text-ink-100')}>
              {SPECIALTY_LABEL[booking.specialty]}
            </span>
            <span className="mt-0.5 truncate text-[10px] text-ink-400">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </span>
          </div>
        </div>

        {booking.adjustmentNote && rowSpan >= 2 && (
          <p className="mt-1 line-clamp-1 pl-2 text-[10px] text-yellow-500/80">
            ⚠ {booking.adjustmentNote}
          </p>
        )}
        {booking.notes && rowSpan >= 2 && (
          <p className="mt-0.5 line-clamp-2 pl-2 text-[10px] text-ink-400">
            {booking.notes}
          </p>
        )}
      </button>
    </div>
  );
}
