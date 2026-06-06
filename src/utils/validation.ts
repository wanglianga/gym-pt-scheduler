import type { Booking, CoursePackage } from '../types';

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export const validatePackageBalance = (
  pkg: CoursePackage | undefined,
  requiredSessions: number = 1
): ValidationResult => {
  if (!pkg) {
    return { valid: false, message: '未找到有效的课包' };
  }

  if (pkg.status !== 'active') {
    return { valid: false, message: '课包状态不可用' };
  }

  const remaining = pkg.totalSessions - pkg.usedSessions;
  if (remaining <= 0) {
    return { valid: false, message: '课包已用完' };
  }

  const now = new Date();
  if (new Date(pkg.expireDate) < now) {
    return { valid: false, message: '课包已过期' };
  }

  if (remaining < requiredSessions) {
    return {
      valid: false,
      message: `课包余额不足，剩余 ${remaining} 节课，需要 ${requiredSessions} 节课`
    };
  }

  if (remaining <= 3) {
    return {
      valid: true,
      message: `课包余额不足，剩余 ${remaining} 节课，建议提醒会员续费`
    };
  }

  return { valid: true, message: '课包余额充足' };
};

export const validateTimeSlotConflict = (
  bookings: Booking[],
  coachId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): ValidationResult => {
  if (startTime >= endTime) {
    return { valid: false, message: '结束时间必须晚于开始时间' };
  }

  const coachBookings = bookings.filter(
    (b) =>
      b.coachId === coachId &&
      b.date === date &&
      b.id !== excludeBookingId &&
      b.status !== 'cancelled' &&
      b.status !== 'leave'
  );

  for (const booking of coachBookings) {
    if (startTime < booking.endTime && endTime > booking.startTime) {
      return {
        valid: false,
        message: `时间段冲突：${booking.startTime} - ${booking.endTime} 已有预约`
      };
    }
  }

  return { valid: true, message: '时间段可用' };
};

export const validateMemberTimeSlotConflict = (
  bookings: Booking[],
  memberId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): ValidationResult => {
  if (startTime >= endTime) {
    return { valid: false, message: '结束时间必须晚于开始时间' };
  }

  const memberBookings = bookings.filter(
    (b) =>
      b.memberId === memberId &&
      b.date === date &&
      b.id !== excludeBookingId &&
      b.status !== 'cancelled' &&
      b.status !== 'leave'
  );

  for (const booking of memberBookings) {
    if (startTime < booking.endTime && endTime > booking.startTime) {
      return {
        valid: false,
        message: `该会员已有其他预约：${booking.startTime} - ${booking.endTime}`
      };
    }
  }

  return { valid: true, message: '时间段可用' };
};

export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: '请输入有效的手机号码' };
  }
  return { valid: true, message: '手机号格式正确' };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName}不能为空` };
  }
  return { valid: true, message: '' };
};

export const validateTimeRange = (startTime: string, endTime: string): ValidationResult => {
  if (!startTime || !endTime) {
    return { valid: false, message: '请填写完整的开始和结束时间' };
  }

  if (startTime >= endTime) {
    return { valid: false, message: '结束时间必须晚于开始时间' };
  }

  if (startTime < '06:00') {
    return { valid: false, message: '预约时间不能早于 06:00' };
  }

  if (endTime > '22:00') {
    return { valid: false, message: '预约时间不能晚于 22:00' };
  }

  return { valid: true, message: '时间范围有效' };
};

export const validateSessions = (sessions: number): ValidationResult => {
  if (!Number.isInteger(sessions) || sessions <= 0) {
    return { valid: false, message: '课时数必须为正整数' };
  }
  if (sessions > 1000) {
    return { valid: false, message: '课时数不能超过 1000' };
  }
  return { valid: true, message: '课时数有效' };
};
