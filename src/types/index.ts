export type Gender = 'male' | 'female' | 'other';

export type MemberLevel = 'basic' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type CoachSpecialty =
  | 'strength'
  | 'cardio'
  | 'yoga'
  | 'pilates'
  | 'hiit'
  | 'boxing'
  | 'rehab'
  | 'nutrition';

export type BookingStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'leave';

export type PackageStatus = 'active' | 'expired' | 'depleted';

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  phone: string;
  avatar?: string;
  level: MemberLevel;
  joinDate: string;
  height: number;
  weight: number;
  injuries: string[];
  trainingGoals: string[];
  notes: string;
  primaryCoachId?: string;
}

export interface Coach {
  id: string;
  name: string;
  gender: Gender;
  avatar?: string;
  phone: string;
  specialties: CoachSpecialty[];
  certification: string[];
  experienceYears: number;
  hourlyRate: number;
  workingHours: {
    start: string;
    end: string;
  };
  daysOff: number[];
  bio: string;
}

export interface Booking {
  id: string;
  memberId: string;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  specialty: CoachSpecialty;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoursePackage {
  id: string;
  memberId: string;
  name: string;
  specialty: CoachSpecialty;
  totalSessions: number;
  usedSessions: number;
  price: number;
  purchaseDate: string;
  expireDate: string;
  status: PackageStatus;
}

export interface Deduction {
  id: string;
  memberId: string;
  packageId: string;
  bookingId?: string;
  sessions: number;
  reason: string;
  deductedAt: string;
  operatorName: string;
}

export interface BodyMetric {
  id: string;
  memberId: string;
  measuredAt: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  bmi: number;
  waist: number;
  hip: number;
  chest: number;
  restingHeartRate: number;
  notes?: string;
}

export type MetricKey =
  | 'weight'
  | 'bodyFat'
  | 'muscleMass'
  | 'bmi'
  | 'waist'
  | 'hip'
  | 'chest'
  | 'restingHeartRate';

export interface MetricMeta {
  key: MetricKey;
  label: string;
  unit: string;
  goodMin?: number;
  goodMax?: number;
}

export const METRIC_META: MetricMeta[] = [
  { key: 'weight', label: '体重', unit: 'kg' },
  { key: 'bodyFat', label: '体脂率', unit: '%', goodMin: 10, goodMax: 22 },
  { key: 'muscleMass', label: '肌肉量', unit: 'kg', goodMin: 40 },
  { key: 'bmi', label: 'BMI', unit: '', goodMin: 18.5, goodMax: 24 },
  { key: 'waist', label: '腰围', unit: 'cm' },
  { key: 'hip', label: '臀围', unit: 'cm' },
  { key: 'chest', label: '胸围', unit: 'cm' },
  { key: 'restingHeartRate', label: '静息心率', unit: 'bpm', goodMin: 60, goodMax: 80 },
];

export const MEMBER_LEVEL_LABEL: Record<MemberLevel, string> = {
  basic: '普通会员',
  silver: '银卡',
  gold: '金卡',
  platinum: '铂金',
  diamond: '钻石',
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  scheduled: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '未到店',
  leave: '已请假',
};

export const SPECIALTY_LABEL: Record<CoachSpecialty, string> = {
  strength: '力量训练',
  cardio: '有氧训练',
  yoga: '瑜伽',
  pilates: '普拉提',
  hiit: 'HIIT',
  boxing: '搏击',
  rehab: '康复训练',
  nutrition: '营养指导',
};

export const PACKAGE_STATUS_LABEL: Record<PackageStatus, string> = {
  active: '有效中',
  expired: '已过期',
  depleted: '已用完',
};

export interface TimeSlot {
  time: string;
  label: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}
