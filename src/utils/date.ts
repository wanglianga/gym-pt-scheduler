import type { DateRange, TimeSlot } from '../types';

export const formatDate = (date: Date, pattern: string = 'YYYY-MM-DD'): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');

  return pattern
    .replace('YYYY', String(y))
    .replace('MM', m)
    .replace('DD', d)
    .replace('HH', h)
    .replace('mm', min)
    .replace('ss', s);
};

export const parseDate = (dateStr: string): Date => {
  const str = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
  return new Date(str);
};

export const isToday = (date: Date | string): boolean => {
  const target = typeof date === 'string' ? parseDate(date) : date;
  const today = new Date();
  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  );
};

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getWeekRange = (baseDate: Date = new Date()): DateRange => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getWeekDates = (baseDate: Date = new Date()): Date[] => {
  const { start } = getWeekRange(baseDate);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
};

export const getWeekdayName = (date: Date, short: boolean = false): string => {
  const weekdays = short
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[date.getDay()];
};

export const getTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`;
    slots.push({ time, label: time });
  }
  return slots;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatTime = (date: Date | string): string => {
  if (typeof date === 'string') {
    if (/^\d{2}:\d{2}$/.test(date)) {
      return date;
    }
    const d = parseDate(date);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return date;
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
};

export const isExpired = (dateStr: string): boolean => {
  return daysBetween(new Date(), dateStr) < 0;
};
