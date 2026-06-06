import { create } from 'zustand';
import type { Coach } from '../types';
import { coaches as mockCoaches } from '../data/coaches';

interface CoachState {
  coaches: Coach[];
  loading: boolean;
  selectedCoachId: string | null;
  loadCoaches: () => Promise<void>;
  getCoachById: (id: string) => Coach | undefined;
  searchCoaches: (keyword: string) => Coach[];
  addCoach: (coach: Omit<Coach, 'id'>) => Coach;
  updateCoach: (id: string, data: Partial<Coach>) => Coach | undefined;
  deleteCoach: (id: string) => boolean;
  setSelectedCoach: (id: string | null) => void;
}

export const useCoachStore = create<CoachState>((set, get) => ({
  coaches: [],
  loading: false,
  selectedCoachId: null,

  loadCoaches: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    set({
      coaches: [...mockCoaches],
      selectedCoachId: mockCoaches[0]?.id ?? null,
      loading: false
    });
  },

  getCoachById: (id: string) => {
    return get().coaches.find((c) => c.id === id);
  },

  searchCoaches: (keyword: string) => {
    const k = keyword.trim().toLowerCase();
    if (!k) return get().coaches;
    return get().coaches.filter(
      (c) =>
        c.name.toLowerCase().includes(k) ||
        c.specialties.some((s) => s.toLowerCase().includes(k))
    );
  },

  addCoach: (coach: Omit<Coach, 'id'>) => {
    const id = `c-${Date.now()}`;
    const newCoach: Coach = { ...coach, id };
    set((state) => ({ coaches: [...state.coaches, newCoach] }));
    return newCoach;
  },

  updateCoach: (id: string, data: Partial<Coach>) => {
    let updated: Coach | undefined;
    set((state) => {
      const coaches = state.coaches.map((c) => {
        if (c.id === id) {
          updated = { ...c, ...data };
          return updated;
        }
        return c;
      });
      return { coaches };
    });
    return updated;
  },

  deleteCoach: (id: string) => {
    const exists = get().coaches.some((c) => c.id === id);
    if (!exists) return false;
    set((state) => ({
      coaches: state.coaches.filter((c) => c.id !== id),
      selectedCoachId: state.selectedCoachId === id ? null : state.selectedCoachId
    }));
    return true;
  },

  setSelectedCoach: (id: string | null) => {
    set({ selectedCoachId: id });
  }
}));
