import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, Ministry, MinistryMember, FinancialRecord, ChurchEvent } from '@shared/types';
interface DataState {
  members: Member[];
  ministries: Ministry[];
  ministryMembers: MinistryMember[];
  financialRecords: FinancialRecord[];
  events: ChurchEvent[];
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  setMinistries: (ministries: Ministry[]) => void;
  addMinistry: (ministry: Ministry) => void;
  updateMinistry: (id: string, updates: Partial<Ministry>) => void;
  deleteMinistry: (id: string) => void;
  setMinistryMembers: (items: MinistryMember[]) => void;
  linkMember: (item: MinistryMember) => void;
  unlinkMember: (id: string) => void;
  setFinancialRecords: (records: FinancialRecord[]) => void;
  addFinancialRecord: (record: FinancialRecord) => void;
  deleteFinancialRecord: (id: string) => void;
  setEvents: (events: ChurchEvent[]) => void;
  addEvent: (event: ChurchEvent) => void;
  updateEvent: (id: string, updates: Partial<ChurchEvent>) => void;
  deleteEvent: (id: string) => void;
}
export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      members: [],
      ministries: [],
      ministryMembers: [],
      financialRecords: [],
      events: [],
      setMembers: (members) => set({ members }),
      addMember: (member) => set((state) => ({
        members: state.members.some(m => m.id === member.id) ? state.members : [...state.members, member]
      })),
      updateMember: (id, updates) => set((state) => ({
        members: state.members.map(m => m.id === id ? { ...m, ...updates } : m)
      })),
      deleteMember: (id) => set((state) => ({
        members: state.members.filter(m => m.id !== id)
      })),
      setMinistries: (ministries) => set({ ministries }),
      addMinistry: (ministry) => set((state) => ({
        ministries: state.ministries.some(m => m.id === ministry.id) ? state.ministries : [...state.ministries, ministry]
      })),
      updateMinistry: (id, updates) => set((state) => ({
        ministries: state.ministries.map(m => m.id === id ? { ...m, ...updates } : m)
      })),
      deleteMinistry: (id) => set((state) => ({
        ministries: state.ministries.filter(m => m.id !== id)
      })),
      setMinistryMembers: (ministryMembers) => set({ ministryMembers }),
      linkMember: (item) => set((state) => ({
        ministryMembers: [...state.ministryMembers, item]
      })),
      unlinkMember: (id) => set((state) => ({
        ministryMembers: state.ministryMembers.filter(mm => mm.id !== id)
      })),
      setFinancialRecords: (financialRecords) => set({ financialRecords }),
      addFinancialRecord: (record) => set((state) => ({
        financialRecords: [record, ...state.financialRecords]
      })),
      deleteFinancialRecord: (id) => set((state) => ({
        financialRecords: state.financialRecords.filter(r => r.id !== id)
      })),
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({
        events: [...state.events, event]
      })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map(e => e.id === id ? { ...e, ...updates } : e)
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id)
      })),
    }),
    {
      name: 'churchflow-data-v4',
    }
  )
);