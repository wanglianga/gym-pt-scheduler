import { useState, useEffect, useMemo } from 'react';
import { X, LogOut, User, Calendar, Clock, AlertTriangle, CheckCircle, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberStore } from '@/store/useMemberStore';
import { useCoachStore } from '@/store/useCoachStore';
import { useBookingStore } from '@/store/useBookingStore';
import type { Booking } from '@/types';
import { SPECIALTY_LABEL } from '@/types';

interface LeaveModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
  onSuccess?: () => void;
}

const LEAVE_TYPES = [
  { value: 'illness', label: '身体不适', icon: '🤒' },
  { value: 'business', label: '工作出差', icon: '✈️' },
  { value: 'personal', label: '个人事务', icon: '📋' },
  { value: 'emergency', label: '紧急情况', icon: '🚨' },
  { value: 'holiday', label: '节假日', icon: '🎉' },
  { value: 'other', label: '其他原因', icon: '💡' },
];

export default function LeaveModal({ open, onClose, bookingId, onSuccess }: LeaveModalProps) {
  const { getBookingById, updateBookingStatus, loadBookings } = useBookingStore();
  const { getMemberById, loadMembers } = useMemberStore();
  const { getCoachById, loadCoaches } = useCoachStore();

  const [leaveType, setLeaveType] = useState('');
  const [deductSession, setDeductSession] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const booking = useMemo(() => {
    if (!bookingId) return undefined;
    return getBookingById(bookingId);
  }, [bookingId, getBookingById]);

  const member = useMemo(() => {
    if (!booking) return undefined;
    return getMemberById(booking.memberId);
  }, [booking, getMemberById]);

  const coach = useMemo(() => {
    if (!booking) return undefined;
    return getCoachById(booking.coachId);
  }, [booking, getCoachById]);

  useEffect(() => {
    if (open) {
      loadBookings();
      loadMembers();
      loadCoaches();
    }
    if (open) {
      setLeaveType('');
      setDeductSession(false);
      setLeaveReason('');
    }
  }, [open, loadBookings, loadMembers, loadCoaches]);

  const canSubmit = leaveType && leaveReason.trim();

  const handleSubmit = () => {
    if (!canSubmit || !booking) return;
    setSubmitting(true);
    try {
      updateBookingStatus(booking.id, 'leave');
      onSuccess?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !booking || !member || !coach) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-ink-800 border border-ink-700 rounded-2xl shadow-industrial animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-ink-800/95 backdrop-blur border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/20 text-info">
              <LogOut size={20} />
            </div>
            <div>
              <h2 className="text-xl font-heading tracking-wide">请假申请</h2>
              <p className="text-sm text-ink-400">会员临时请假处理</p>
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
                <div className="text-ink-400 text-xs">教练</div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center text-xs">
                    {coach.name[0]}
                  </div>
                  <span className="font-medium">{coach.name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-ink-400 text-xs">课程类型</div>
                <div className="font-medium text-orange">{SPECIALTY_LABEL[booking.specialty]}</div>
              </div>
              <div className="space-y-1">
                <div className="text-ink-400 text-xs">预约时间</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar size={14} className="text-ink-400" />
                  {booking.date}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-ink-400 text-xs mb-1">时间段</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock size={14} className="text-ink-400" />
                  {booking.startTime} - {booking.endTime}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <AlertTriangle size={14} className="text-orange" />
              请假类型 <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LEAVE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setLeaveType(type.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                    leaveType === type.value
                      ? 'bg-orange/10 border-orange/50 text-orange'
                      : 'bg-ink-900 border-ink-700 hover:border-ink-600 text-ink-300'
                  )}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-3">
              <CheckCircle size={14} className="text-orange" />
              是否扣课时 <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeductSession(false)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  !deductSession
                    ? 'bg-lime/10 border-lime/50'
                    : 'bg-ink-900 border-ink-700 hover:border-ink-600'
                )}
              >
                <div className={cn('font-medium', !deductSession ? 'text-lime' : 'text-ink-200')}>
                  不扣课时
                </div>
                <div className="text-xs text-ink-400 mt-1">
                  合理原因请假，不计入消耗
                </div>
              </button>
              <button
                onClick={() => setDeductSession(true)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  deductSession
                    ? 'bg-danger/10 border-danger/50'
                    : 'bg-ink-900 border-ink-700 hover:border-ink-600'
                )}
              >
                <div className={cn('font-medium', deductSession ? 'text-danger' : 'text-ink-200')}>
                  扣除课时
                </div>
                <div className="text-xs text-ink-400 mt-1">
                  临时爽约或多次请假
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <StickyNote size={14} className="text-orange" />
              请假原因 <span className="text-danger">*</span>
            </label>
            <textarea
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="请详细说明请假原因..."
              rows={4}
              className="input resize-none"
            />
          </div>

          <div className={cn(
            'p-4 rounded-xl border flex items-start gap-3',
            deductSession ? 'bg-danger/10 border-danger/30' : 'bg-lime/10 border-lime/30'
          )}>
            {deductSession ? (
              <AlertTriangle size={18} className="text-danger mt-0.5 shrink-0" />
            ) : (
              <CheckCircle size={18} className="text-lime mt-0.5 shrink-0" />
            )}
            <div className="text-sm">
              {deductSession ? (
                <>
                  <span className="font-medium text-danger">警告：</span>
                  <span className="text-ink-300"> 选择扣除课时将从会员课包中扣减 1 课时，会员将收到通知。</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-lime">提示：</span>
                  <span className="text-ink-300"> 选择不扣课时将保留课时余额，可在后续改约使用。</span>
                </>
              )}
            </div>
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
            {submitting ? '提交中...' : '确认请假'}
          </button>
        </div>
      </div>
    </div>
  );
}
