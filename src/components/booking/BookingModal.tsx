import { useState, useEffect, useMemo } from 'react';
import { X, CalendarPlus, User, Dumbbell, Clock, StickyNote, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberStore } from '@/store/useMemberStore';
import { useCoachStore } from '@/store/useCoachStore';
import { usePackageStore } from '@/store/usePackageStore';
import { useBookingStore } from '@/store/useBookingStore';
import type { CoachSpecialty } from '@/types';
import { SPECIALTY_LABEL } from '@/types';
import { formatDate, getTimeSlots } from '@/utils/date';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMemberId?: string;
  initialCoachId?: string;
  initialDate?: string;
  initialStartTime?: string;
}

export default function BookingModal({
  open,
  onClose,
  onSuccess,
  initialMemberId = '',
  initialCoachId = '',
  initialDate,
  initialStartTime = '',
}: BookingModalProps) {
  const { members, loadMembers, searchMembers } = useMemberStore();
  const { coaches, loadCoaches } = useCoachStore();
  const { getValidPackageByMember, loadPackages } = usePackageStore();
  const { addBooking, getBookingsByCoachAndDate } = useBookingStore();

  const [memberKeyword, setMemberKeyword] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<CoachSpecialty | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && !submitted) {
      loadMembers();
      loadCoaches();
      loadPackages();
      setSelectedMemberId(initialMemberId || '');
      setSelectedCoachId(initialCoachId || '');
      setSelectedDate(initialDate || formatDate(new Date()));
      setSelectedStartTime(initialStartTime || '');
      if (initialStartTime) {
        const startHour = parseInt(initialStartTime.split(':')[0]);
        const endHour = startHour + 1;
        setSelectedEndTime(`${String(endHour).padStart(2, '0')}:00`);
      } else {
        setSelectedEndTime('');
      }
      setSelectedSpecialty('');
      setNotes('');
    }
  }, [open, initialMemberId, initialCoachId, initialDate, initialStartTime, submitted, loadMembers, loadCoaches, loadPackages]);

  const filteredMembers = useMemo(() => {
    return searchMembers(memberKeyword);
  }, [memberKeyword, searchMembers]);

  const validPackage = useMemo(() => {
    if (!selectedMemberId || !selectedSpecialty) return undefined;
    return getValidPackageByMember(selectedMemberId, selectedSpecialty);
  }, [selectedMemberId, selectedSpecialty, getValidPackageByMember]);

  const packageBalance = validPackage ? validPackage.totalSessions - validPackage.usedSessions : 0;

  const timeSlots = getTimeSlots();

  const coachOccupiedSlots = useMemo(() => {
    if (!selectedCoachId || !selectedDate) return new Set<string>();
    const bookings = getBookingsByCoachAndDate(selectedCoachId, selectedDate);
    const occupied = new Set<string>();
    bookings.forEach((b) => {
      const start = parseInt(b.startTime.split(':')[0]);
      const end = parseInt(b.endTime.split(':')[0]);
      for (let h = start; h < end; h++) {
        occupied.add(`${String(h).padStart(2, '0')}:00`);
      }
    });
    return occupied;
  }, [selectedCoachId, selectedDate, getBookingsByCoachAndDate]);

  const canSubmit =
    selectedMemberId &&
    selectedCoachId &&
    selectedDate &&
    selectedStartTime &&
    selectedEndTime &&
    selectedSpecialty &&
    packageBalance > 0;

  const handleStartTimeChange = (time: string) => {
    setSelectedStartTime(time);
    const startHour = parseInt(time.split(':')[0]);
    const endHour = startHour + 1;
    setSelectedEndTime(`${String(endHour).padStart(2, '0')}:00`);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      addBooking({
        memberId: selectedMemberId,
        coachId: selectedCoachId,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        status: 'scheduled',
        specialty: selectedSpecialty,
        notes: notes || undefined,
      });
      setSubmitted(true);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setMemberKeyword('');
    setSelectedMemberId('');
    setSelectedCoachId('');
    setSelectedDate(formatDate(new Date()));
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedSpecialty('');
    setNotes('');
  };

  const handleCloseAndReset = () => {
    handleReset();
    setSubmitted(false);
    onClose();
  };

  if (!open) return null;

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const selectedCoach = coaches.find((c) => c.id === selectedCoachId);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-ink-800 border border-ink-700 rounded-2xl shadow-industrial animate-scale-in overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center mb-4 animate-scale-in">
              <CheckCircle size={36} className="text-lime" />
            </div>
            <h2 className="text-2xl font-heading font-bold tracking-wide text-ink-50 mb-2">
              预约成功
            </h2>
            <p className="text-ink-300 text-sm">以下课程已成功创建</p>
          </div>
          <div className="px-6 py-5 border-y border-ink-700 bg-ink-900/50 space-y-3">
            {selectedMember && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-xs font-medium">
                  {selectedMember.name[0]}
                </div>
                <div>
                  <div className="text-xs text-ink-400">会员</div>
                  <div className="font-medium">{selectedMember.name}</div>
                </div>
              </div>
            )}
            {selectedCoach && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-xs font-medium text-orange">
                  {selectedCoach.name[0]}
                </div>
                <div>
                  <div className="text-xs text-ink-400">教练</div>
                  <div className="font-medium">{selectedCoach.name}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                <CalendarPlus size={14} className="text-info" />
              </div>
              <div>
                <div className="text-xs text-ink-400">课程时间</div>
                <div className="font-medium">
                  {selectedDate} · {selectedStartTime} - {selectedEndTime}
                </div>
              </div>
            </div>
            {selectedSpecialty && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center">
                  <Dumbbell size={14} className="text-lime" />
                </div>
                <div>
                  <div className="text-xs text-ink-400">课程类型</div>
                  <div className="font-medium">{SPECIALTY_LABEL[selectedSpecialty]}</div>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex gap-3">
            <button onClick={handleCloseAndReset} className="btn-secondary flex-1">
              关闭
            </button>
            <button
              onClick={handleCloseAndReset}
              className="btn-primary flex-1"
            >
              继续排课
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-800 border border-ink-700 rounded-2xl shadow-industrial animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-ink-800/95 backdrop-blur border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange/20 text-orange">
              <CalendarPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-heading tracking-wide">新建预约</h2>
              <p className="text-sm text-ink-400">为会员创建课程预约</p>
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
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <User size={14} className="text-orange" />
              选择会员 <span className="text-danger">*</span>
            </label>
            {!selectedMemberId ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    value={memberKeyword}
                    onChange={(e) => setMemberKeyword(e.target.value)}
                    placeholder="搜索会员姓名、手机号或等级"
                    className="input pl-10"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-ink-700 bg-ink-900">
                  {filteredMembers.length === 0 ? (
                    <div className="p-4 text-center text-ink-400 text-sm">未找到匹配会员</div>
                  ) : (
                    filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMemberId(member.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-ink-800 transition-colors border-b border-ink-700 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm font-medium">
                            {member.name[0]}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-ink-400">{member.phone}</div>
                          </div>
                        </div>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          member.level === 'diamond' && 'bg-orange/20 text-orange',
                          member.level === 'platinum' && 'bg-lime/20 text-lime',
                          member.level === 'gold' && 'bg-yellow-500/20 text-yellow-500',
                          member.level === 'silver' && 'bg-ink-400/20 text-ink-300',
                          member.level === 'basic' && 'bg-ink-500/20 text-ink-400',
                        )}>
                          {member.level.toUpperCase()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-ink-900 border border-ink-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center font-medium">
                    {members.find((m) => m.id === selectedMemberId)?.name[0]}
                  </div>
                  <div>
                    <div className="font-medium">{members.find((m) => m.id === selectedMemberId)?.name}</div>
                    <div className="text-xs text-ink-400">{members.find((m) => m.id === selectedMemberId)?.phone}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMemberId('')}
                  className="text-xs text-ink-400 hover:text-orange transition-colors"
                >
                  更换
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <Dumbbell size={14} className="text-orange" />
              课程类型 <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(SPECIALTY_LABEL) as [CoachSpecialty, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSpecialty(key)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-all border',
                    selectedSpecialty === key
                      ? 'bg-orange/20 text-orange border-orange/50 shadow-glow-orange'
                      : 'bg-ink-900 text-ink-300 border-ink-700 hover:border-ink-600'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {selectedMemberId && (
            <div className={cn(
              'p-4 rounded-xl border flex items-start gap-3',
              packageBalance > 0
                ? 'bg-lime/10 border-lime/30'
                : 'bg-danger/10 border-danger/30'
            )}>
              {packageBalance > 0 ? (
                <CheckCircle size={18} className="text-lime mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-danger mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-medium', packageBalance > 0 ? 'text-lime' : 'text-danger')}>
                  {validPackage ? validPackage.name : '未找到有效课包'}
                </div>
                <div className="text-xs text-ink-400 mt-0.5">
                  {validPackage
                    ? `剩余课时：${packageBalance} / ${validPackage.totalSessions} 节`
                    : selectedSpecialty
                      ? '该课程类型没有可用课包，请先购买或选择其他类型'
                      : '请先选择课程类型查看课包余额'}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <User size={14} className="text-orange" />
              选择教练 <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {coaches.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => setSelectedCoachId(coach.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                    selectedCoachId === coach.id
                      ? 'bg-orange/10 border-orange/50'
                      : 'bg-ink-900 border-ink-700 hover:border-ink-600'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center font-medium">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
                <CalendarPlus size={14} className="text-orange" />
                预约日期 <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={formatDate(new Date())}
                className="input"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
                <Clock size={14} className="text-orange" />
                开始时间 <span className="text-danger">*</span>
              </label>
              <select
                value={selectedStartTime}
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
          </div>

          {selectedStartTime && selectedEndTime && (
            <div className="flex items-center gap-2 text-sm text-ink-300">
              <Clock size={14} className="text-ink-400" />
              课程时长：{selectedStartTime} - {selectedEndTime}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
              <StickyNote size={14} className="text-orange" />
              备注
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="可填写训练目标、注意事项等..."
              rows={3}
              className="input resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-ink-800/95 backdrop-blur border-t border-ink-700">
          <button onClick={handleCloseAndReset} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="btn-primary"
          >
            {submitting ? '提交中...' : '确认预约'}
          </button>
        </div>
      </div>
    </div>
  );
}
