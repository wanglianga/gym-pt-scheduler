import { useState, useEffect, useMemo } from 'react';
import { X, CalendarClock, User, Clock, StickyNote, AlertCircle, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberStore } from '@/store/useMemberStore';
import { useCoachStore } from '@/store/useCoachStore';
import { useBookingStore } from '@/store/useBookingStore';
import type { Booking } from '@/types';
import { SPECIALTY_LABEL, BOOKING_STATUS_LABEL } from '@/types';
import { formatDate, getTimeSlots } from '@/utils/date';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
  onSuccess?: () => void;
}

export default function RescheduleModal({ open, onClose, bookingId, onSuccess }: RescheduleModalProps) {
  const { getBookingById, rescheduleBooking, getBookingsByCoachAndDate, loadBookings } = useBookingStore();
  const { getMemberById, loadMembers } = useMemberStore();
  const { getCoachById, coaches, loadCoaches } = useCoachStore();

  const [newDate, setNewDate] = useState(formatDate(new Date()));
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newCoachId, setNewCoachId] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const booking = useMemo(() => {
    if (!bookingId) return undefined;
    return getBookingById(bookingId);
  }, [bookingId, getBookingById]);

  const member = useMemo(() => {
    if (!booking) return undefined;
    return getMemberById(booking.memberId);
  }, [booking, getMemberById]);

  const originalCoach = useMemo(() => {
    if (!booking) return undefined;
    return getCoachById(booking.coachId);
  }, [booking, getCoachById]);

  useEffect(() => {
    if (open) {
      loadBookings();
      loadMembers();
      loadCoaches();
    }
    if (booking) {
      setNewDate(booking.date);
      setNewCoachId(booking.coachId);
      setNewStartTime('');
      setNewEndTime('');
      setRescheduleReason('');
    }
  }, [open, booking, loadBookings, loadMembers, loadCoaches]);

  const timeSlots = getTimeSlots();

  const coachOccupiedSlots = useMemo(() => {
    if (!newCoachId || !newDate) return new Set<string>();
    const bookings = getBookingsByCoachAndDate(newCoachId, newDate);
    const occupied = new Set<string>();
    bookings.forEach((b) => {
      if (b.id === booking?.id) return;
      const start = parseInt(b.startTime.split(':')[0]);
      const end = parseInt(b.endTime.split(':')[0]);
      for (let h = start; h < end; h++) {
        occupied.add(`${String(h).padStart(2, '0')}:00`);
      }
    });
    return occupied;
  }, [newCoachId, newDate, booking?.id, getBookingsByCoachAndDate]);

  const canSubmit = newDate && newStartTime && newEndTime && newCoachId && rescheduleReason.trim();

  const handleStartTimeChange = (time: string) => {
    setNewStartTime(time);
    const startHour = parseInt(time.split(':')[0]);
    const endHour = startHour + 1;
    setNewEndTime(`${String(endHour).padStart(2, '0')}:00`);
  };

  const handleSubmit = () => {
    if (!canSubmit || !booking) return;
    setSubmitting(true);
    try {
      rescheduleBooking(booking.id, newDate, newStartTime, newEndTime);
      onSuccess?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !booking || !member || !originalCoach) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-800 border border-ink-700 rounded-2xl shadow-industrial animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-ink-800/95 backdrop-blur border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/20 text-info">
              <CalendarClock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-heading tracking-wide">改约申请</h2>
              <p className="text-sm text-ink-400">修改预约的时间或教练</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-ink-900/60 border border-ink-700">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-3">
              <AlertCircle size={14} className="text-orange" />
              原预约信息
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="text-ink-400 text-xs">会员</div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center text-xs">
                    {member.name[0]}
                  </div>
                  <span className="font-medium">{member.name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-ink-400 text-xs">课程类型</div>
                <div className="font-medium text-orange">{SPECIALTY_LABEL[booking.specialty]}</div>
              </div>
              <div className="space-y-1">
                <div className="text-ink-400 text-xs">教练</div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center text-xs">
                    {originalCoach.name[0]}
                  </div>
                  <span className="font-medium">{originalCoach.name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-ink-400 text-xs">状态</div>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  booking.status === 'confirmed' && 'bg-lime/20 text-lime border border-lime/40',
                  booking.status === 'scheduled' && 'bg-info/20 text-info border border-info/40',
                  booking.status === 'completed' && 'bg-ink-400/20 text-ink-300 border border-ink-400/40',
                  booking.status === 'cancelled' && 'bg-danger/20 text-danger border border-danger/40',
                )}>
                  {BOOKING_STATUS_LABEL[booking.status]}
                </span>
              </div>
              <div className="space-y-1 col-span-2">
                <div className="text-ink-400 text-xs">原预约时间</div>
                <div className="font-medium text-ink-100 flex items-center gap-2">
                  <CalendarPlus size={14} className="text-ink-400" />
                  {booking.date} {booking.startTime} - {booking.endTime}
                </div>
              </div>
              {booking.notes && (
                <div className="space-y-1 col-span-2">
                  <div className="text-ink-400 text-xs">备注</div>
                  <div className="text-ink-300 text-sm">{booking.notes}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <CalendarPlus size={14} className="text-orange" />
              新日期 <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={formatDate(new Date())}
              className="input"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <User size={14} className="text-orange" />
              选择教练 <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {coaches.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => setNewCoachId(coach.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                    newCoachId === coach.id
                      ? 'bg-orange/10 border-orange/50'
                      : 'bg-ink-900 border-ink-700 hover:border-ink-600'
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm font-medium">
                    {coach.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{coach.name}</div>
                    <div className="text-xs text-ink-400 truncate">
                      {coach.specialties.slice(0, 2).map((s) => SPECIALTY_LABEL[s]).join('、')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <Clock size={14} className="text-orange" />
              新开始时间 <span className="text-danger">*</span>
            </label>
            <select
              value={newStartTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="input"
            >
              <option value="">请选择时间</option>
              {timeSlots.map((slot) => (
                <option
                  key={slot.time}
                  value={slot.time}
                  disabled={coachOccupiedSlots.has(slot.time)}
                >
                  {slot.label} {coachOccupiedSlots.has(slot.time) ? '(已约满)' : ''}
                </option>
              ))}
            </select>
          </div>

          {newStartTime && newEndTime && (
            <div className="flex items-center gap-2 text-sm text-ink-300 bg-ink-900/60 p-3 rounded-lg border border-ink-700">
              <Clock size={14} className="text-ink-400" />
              新课程时长：{newDate} {newStartTime} - {newEndTime}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <StickyNote size={14} className="text-orange" />
              改约原因 <span className="text-danger">*</span>
            </label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="请说明改约原因，如临时出差、身体不适等..."
              rows={3}
              className="input resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-ink-800/95 backdrop-blur border-t border-ink-700">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="btn-primary"
          >
            {submitting ? '提交中...' : '确认改约'}
          </button>
        </div>
      </div>
    </div>
  );
}
