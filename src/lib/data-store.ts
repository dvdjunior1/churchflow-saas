import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Member, Ministry, MinistryMember, FinancialRecord, ChurchEvent } from '@shared/types';
interface DataState {
  members: Member[];
  ministries: Ministry[];
  ministryMembers: MinistryMember[];
  financialRecords: FinancialRecord[];
  events: ChurchEvent[];
  lastUpdated: string;
  // Members
  setMembers: (members: Member[]) => void;
  addMember: (member: Omit<Member, 'id' | 'joinedAt'>) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  // Ministries
  setMinistries: (ministries: Ministry[]) => void;
  addMinistry: (ministry: Omit<Ministry, 'id'>) => Ministry;
  updateMinistry: (id: string, updates: Partial<Ministry>) => void;
  deleteMinistry: (id: string) => void;
  // Ministry Members
  setMinistryMembers: (items: MinistryMember[]) => void;
  linkMember: (item: Omit<MinistryMember, 'id'>) => MinistryMember;
  unlinkMember: (id: string) => void;
  // Finances
  setFinancialRecords: (records: FinancialRecord[]) => void;
  addFinancialRecord: (record: Omit<FinancialRecord, 'id'>) => FinancialRecord;
  deleteFinancialRecord: (id: string) => void;
  // Events
  setEvents: (events: ChurchEvent[]) => void;
  addEvent: (event: Omit<ChurchEvent, 'id'>) => ChurchEvent;
  updateEvent: (id: string, updates: Partial<ChurchEvent>) => void;
  deleteEvent: (id: string) => void;
  // Seeding
  seedIfEmpty: () => void;
}
export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      members: [],
      ministries: [],
      ministryMembers: [],
      financialRecords: [],
      events: [],
      lastUpdated: new Date().toISOString(),
      setMembers: (members) => set({ members, lastUpdated: new Date().toISOString() }),
      addMember: (data) => {
        const member: Member = {
          ...data,
          id: uuidv4(),
          joinedAt: new Date().toISOString(),
        };
        set((state) => ({ members: [...state.members, member], lastUpdated: new Date().toISOString() }));
        return member;
      },
      updateMember: (id, updates) => set((state) => ({
        members: state.members.map(m => m.id === id ? { ...m, ...updates } : m),
        lastUpdated: new Date().toISOString()
      })),
      deleteMember: (id) => set((state) => ({
        members: state.members.filter(m => m.id !== id),
        ministryMembers: state.ministryMembers.filter(mm => mm.memberId !== id),
        lastUpdated: new Date().toISOString()
      })),
      setMinistries: (ministries) => set({ ministries, lastUpdated: new Date().toISOString() }),
      addMinistry: (data) => {
        const ministry: Ministry = { ...data, id: uuidv4() };
        set((state) => ({ ministries: [...state.ministries, ministry], lastUpdated: new Date().toISOString() }));
        return ministry;
      },
      updateMinistry: (id, updates) => set((state) => ({
        ministries: state.ministries.map(m => m.id === id ? { ...m, ...updates } : m),
        lastUpdated: new Date().toISOString()
      })),
      deleteMinistry: (id) => set((state) => ({
        ministries: state.ministries.filter(m => m.id !== id),
        ministryMembers: state.ministryMembers.filter(mm => mm.ministryId !== id),
        lastUpdated: new Date().toISOString()
      })),
      setMinistryMembers: (items) => set({ ministryMembers: items, lastUpdated: new Date().toISOString() }),
      linkMember: (data) => {
        const mm: MinistryMember = { ...data, id: uuidv4() };
        set((state) => ({ ministryMembers: [...state.ministryMembers, mm], lastUpdated: new Date().toISOString() }));
        return mm;
      },
      unlinkMember: (id) => set((state) => ({
        ministryMembers: state.ministryMembers.filter(mm => mm.id !== id),
        lastUpdated: new Date().toISOString()
      })),
      setFinancialRecords: (records) => set({ financialRecords: records, lastUpdated: new Date().toISOString() }),
      addFinancialRecord: (data) => {
        const record: FinancialRecord = { ...data, id: uuidv4() };
        set((state) => ({ financialRecords: [record, ...state.financialRecords], lastUpdated: new Date().toISOString() }));
        return record;
      },
      deleteFinancialRecord: (id) => set((state) => ({
        financialRecords: state.financialRecords.filter(r => r.id !== id),
        lastUpdated: new Date().toISOString()
      })),
      setEvents: (events) => set({ events, lastUpdated: new Date().toISOString() }),
      addEvent: (data) => {
        const event: ChurchEvent = { ...data, id: uuidv4() };
        set((state) => ({ events: [...state.events, event], lastUpdated: new Date().toISOString() }));
        return event;
      },
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map(e => e.id === id ? { ...e, ...updates } : e),
        lastUpdated: new Date().toISOString()
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id),
        lastUpdated: new Date().toISOString()
      })),
      seedIfEmpty: () => {
        const state = get();
        if (state.members.length > 0) return;
        const m1Id = uuidv4();
        const m2Id = uuidv4();
        const min1Id = uuidv4();
        const min2Id = uuidv4();
        const seedMembers: Member[] = [
          {
            id: m1Id,
            fullName: "João Silva",
            email: "joao@example.com",
            phone: "11999998888",
            photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
            birthDate: "1985-05-15",
            baptismDate: "2010-10-20",
            role: "Pastor",
            joinedAt: new Date().toISOString()
          },
          {
            id: m2Id,
            fullName: "Maria Oliveira",
            email: "maria@example.com",
            phone: "11888887777",
            photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
            birthDate: "1992-08-22",
            role: "Líder de Louvor",
            joinedAt: new Date().toISOString()
          }
        ];
        const seedMinistries: Ministry[] = [
          { id: min1Id, name: "Louvor & Adoração", description: "Equipe de música", leaderId: m2Id },
          { id: min2Id, name: "Kids", description: "Ministério infantil" }
        ];
        const seedMM: MinistryMember[] = [
          { id: uuidv4(), memberId: m2Id, ministryId: min1Id, role: 'leader' },
          { id: uuidv4(), memberId: m1Id, ministryId: min2Id, role: 'member' }
        ];
        set({
          members: seedMembers,
          ministries: seedMinistries,
          ministryMembers: seedMM,
          lastUpdated: new Date().toISOString()
        });
      }
    }),
    { name: 'churchflow-local-storage-v1' }
  )
);