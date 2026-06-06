import { create } from 'zustand';
import type { Member } from '../types';
import { members as mockMembers } from '../data/members';

interface MemberState {
  members: Member[];
  loading: boolean;
  loadMembers: () => Promise<void>;
  getMemberById: (id: string) => Member | undefined;
  searchMembers: (keyword: string) => Member[];
  addMember: (member: Omit<Member, 'id'>) => Member;
  updateMember: (id: string, data: Partial<Member>) => Member | undefined;
  deleteMember: (id: string) => boolean;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  loading: false,

  loadMembers: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    set({ members: [...mockMembers], loading: false });
  },

  getMemberById: (id: string) => {
    return get().members.find((m) => m.id === id);
  },

  searchMembers: (keyword: string) => {
    const k = keyword.trim().toLowerCase();
    if (!k) return get().members;
    return get().members.filter(
      (m) =>
        m.name.toLowerCase().includes(k) ||
        m.phone.includes(k) ||
        m.level.toLowerCase().includes(k)
    );
  },

  addMember: (member: Omit<Member, 'id'>) => {
    const id = `m-${Date.now()}`;
    const newMember: Member = { ...member, id };
    set((state) => ({ members: [...state.members, newMember] }));
    return newMember;
  },

  updateMember: (id: string, data: Partial<Member>) => {
    let updated: Member | undefined;
    set((state) => {
      const members = state.members.map((m) => {
        if (m.id === id) {
          updated = { ...m, ...data };
          return updated;
        }
        return m;
      });
      return { members };
    });
    return updated;
  },

  deleteMember: (id: string) => {
    const exists = get().members.some((m) => m.id === id);
    if (!exists) return false;
    set((state) => ({ members: state.members.filter((m) => m.id !== id) }));
    return true;
  }
}));
