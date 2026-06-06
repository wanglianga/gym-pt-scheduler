import { create } from 'zustand';
import type { CoursePackage } from '../types';
import { packages as mockPackages } from '../data/packages';

const daysBetween = (date1: Date, date2Str: string): number => {
  const date2 = new Date(date2Str);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((date2.getTime() - date1.getTime()) / msPerDay);
};

interface PackageState {
  packages: CoursePackage[];
  loading: boolean;
  loadPackages: () => Promise<void>;
  getPackageById: (id: string) => CoursePackage | undefined;
  getPackagesByMember: (memberId: string) => CoursePackage[];
  getActivePackagesByMember: (memberId: string) => CoursePackage[];
  getValidPackageByMember: (memberId: string, specialty?: string) => CoursePackage | undefined;
  getExpiringPackages: (days?: number) => CoursePackage[];
  getLowBalancePackages: (threshold?: number) => CoursePackage[];
  addPackage: (pkg: Omit<CoursePackage, 'id'>) => CoursePackage;
  updatePackage: (id: string, data: Partial<CoursePackage>) => CoursePackage | undefined;
  deletePackage: (id: string) => boolean;
  deductSessions: (id: string, sessions?: number) => CoursePackage | undefined;
  refundSessions: (id: string, sessions?: number) => CoursePackage | undefined;
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  loading: false,

  loadPackages: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    set({ packages: [...mockPackages], loading: false });
  },

  getPackageById: (id: string) => {
    return get().packages.find((p) => p.id === id);
  },

  getPackagesByMember: (memberId: string) => {
    return get().packages.filter((p) => p.memberId === memberId);
  },

  getActivePackagesByMember: (memberId: string) => {
    const now = new Date();
    return get()
      .getPackagesByMember(memberId)
      .filter((p) => p.status === 'active' && p.usedSessions < p.totalSessions && new Date(p.expireDate) >= now);
  },

  getValidPackageByMember: (memberId: string, specialty?: string) => {
    let active = get().getActivePackagesByMember(memberId);
    if (specialty) {
      active = active.filter((p) => p.specialty === specialty);
    }
    if (active.length === 0) return undefined;
    active.sort((a, b) => {
      const daysA = daysBetween(new Date(), a.expireDate);
      const daysB = daysBetween(new Date(), b.expireDate);
      return daysA - daysB;
    });
    return active[0];
  },

  getExpiringPackages: (days: number = 30) => {
    const now = new Date();
    return get().packages.filter((p) => {
      if (p.status !== 'active') return false;
      if (p.usedSessions >= p.totalSessions) return false;
      const remaining = daysBetween(now, p.expireDate);
      return remaining >= 0 && remaining <= days;
    });
  },

  getLowBalancePackages: (threshold: number = 5) => {
    return get().packages.filter((p) => {
      if (p.status !== 'active') return false;
      const remaining = p.totalSessions - p.usedSessions;
      return remaining > 0 && remaining <= threshold;
    });
  },

  addPackage: (pkg: Omit<CoursePackage, 'id'>) => {
    const id = `p-${Date.now()}`;
    const newPackage: CoursePackage = { ...pkg, id };
    set((state) => ({ packages: [...state.packages, newPackage] }));
    return newPackage;
  },

  updatePackage: (id: string, data: Partial<CoursePackage>) => {
    let updated: CoursePackage | undefined;
    set((state) => {
      const packages = state.packages.map((p) => {
        if (p.id === id) {
          updated = { ...p, ...data };
          return updated;
        }
        return p;
      });
      return { packages };
    });
    return updated;
  },

  deletePackage: (id: string) => {
    const exists = get().packages.some((p) => p.id === id);
    if (!exists) return false;
    set((state) => ({ packages: state.packages.filter((p) => p.id !== id) }));
    return true;
  },

  deductSessions: (id: string, sessions: number = 1) => {
    const pkg = get().getPackageById(id);
    if (!pkg) return undefined;
    const remaining = pkg.totalSessions - pkg.usedSessions;
    if (remaining < sessions) return undefined;
    return get().updatePackage(id, { usedSessions: pkg.usedSessions + sessions });
  },

  refundSessions: (id: string, sessions: number = 1) => {
    const pkg = get().getPackageById(id);
    if (!pkg) return undefined;
    const newUsed = Math.max(0, pkg.usedSessions - sessions);
    return get().updatePackage(id, { usedSessions: newUsed });
  }
}));
