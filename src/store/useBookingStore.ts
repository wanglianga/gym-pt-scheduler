import { create } from 'zustand';
import type { Booking, BookingStatus } from '../types';
import { bookings as mockBookings } from '../data/bookings';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  loadBookings: () => Promise<void>;
  getBookingById: (id: string) => Booking | undefined;
  getBookingsByCoach: (coachId: string) => Booking[];
  getBookingsByMember: (memberId: string) => Booking[];
  getBookingsByDate: (date: string) => Booking[];
  getBookingsByCoachAndDate: (coachId: string, date: string) => Booking[];
  getTodayBookings: () => Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Booking;
  updateBooking: (id: string, data: Partial<Booking>) => Booking | undefined;
  deleteBooking: (id: string) => boolean;
  updateBookingStatus: (id: string, status: BookingStatus) => Booking | undefined;
  rescheduleBooking: (id: string, date: string, startTime: string, endTime: string) => Booking | undefined;
}

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,

  loadBookings: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    set({ bookings: [...mockBookings], loading: false });
  },

  getBookingById: (id: string) => {
    return get().bookings.find((b) => b.id === id);
  },

  getBookingsByCoach: (coachId: string) => {
    return get().bookings.filter((b) => b.coachId === coachId);
  },

  getBookingsByMember: (memberId: string) => {
    return get().bookings.filter((b) => b.memberId === memberId);
  },

  getBookingsByDate: (date: string) => {
    return get().bookings.filter((b) => b.date === date);
  },

  getBookingsByCoachAndDate: (coachId: string, date: string) => {
    return get().bookings.filter((b) => b.coachId === coachId && b.date === date);
  },

  getTodayBookings: () => {
    const today = formatDate(new Date());
    return get().bookings.filter((b) => b.date === today);
  },

  addBooking: (booking) => {
    const id = `b-${Date.now()}`;
    const now = new Date().toISOString();
    const newBooking: Booking = {
      ...booking,
      id,
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({ bookings: [...state.bookings, newBooking] }));
    return newBooking;
  },

  updateBooking: (id: string, data: Partial<Booking>) => {
    let updated: Booking | undefined;
    set((state) => {
      const bookings = state.bookings.map((b) => {
        if (b.id === id) {
          updated = { ...b, ...data, updatedAt: new Date().toISOString() };
          return updated;
        }
        return b;
      });
      return { bookings };
    });
    return updated;
  },

  deleteBooking: (id: string) => {
    const exists = get().bookings.some((b) => b.id === id);
    if (!exists) return false;
    set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }));
    return true;
  },

  updateBookingStatus: (id: string, status: BookingStatus) => {
    return get().updateBooking(id, { status });
  },

  rescheduleBooking: (id: string, date: string, startTime: string, endTime: string) => {
    return get().updateBooking(id, { date, startTime, endTime });
  }
}));
