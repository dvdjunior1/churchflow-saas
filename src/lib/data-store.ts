import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Member, Ministry, MinistryMember, FinancialRecord, ChurchEvent, Position } from '@shared/types';
interface DataState {
  members: Member[];
  ministries: Ministry[];
  ministryMembers: MinistryMember[];
  financialRecords: FinancialRecord[];
  events: ChurchEvent[];
  positions: Position[];
  lastUpdated: string;
  // Actions
  setMembers: (members: Member[]) => void;
  addMember: (member: Partial<Member>) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  setMinistries: (ministries: Ministry[]) => void;
  addMinistry: (ministry: Omit<Ministry, 'id'>) => Ministry;
  updateMinistry: (id: string, updates: Partial<Ministry>) => void;
  deleteMinistry: (id: string) => void;
  setMinistryMembers: (items: MinistryMember[]) => void;
  linkMember: (item: Omit<MinistryMember, 'id'>) => MinistryMember;
  unlinkMember: (id: string) => void;
  updateMinistryMember: (id: string, updates: Partial<MinistryMember>) => void;
  setPositions: (positions: Position[]) => void;
  addPosition: (pos: Omit<Position, 'id' | 'createdAt' | 'updatedAt' | 'active'>) => Position;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  deactivatePosition: (id: string) => void;
  setFinancialRecords: (records: FinancialRecord[]) => void;
  addFinancialRecord: (record: Omit<FinancialRecord, 'id'>) => FinancialRecord;
  deleteFinancialRecord: (id: string) => void;
  setEvents: (events: ChurchEvent[]) => void;
  addEvent: (event: Omit<ChurchEvent, 'id'>) => ChurchEvent;
  updateEvent: (id: string, updates: Partial<ChurchEvent>) => void;
  deleteEvent: (id: string) => void;
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
      positions: [],
      lastUpdated: new Date().toISOString(),
      setMembers: (members) => set({ members, lastUpdated: new Date().toISOString() }),
      addMember: (data) => {
        const member: Member = {
          fullName: "",
          email: "",
          phone: "",
          photoUrl: "",
          birthDate: "",
          role: "Membro",
          positions: [],
          memberStatus: "ativo",
          showBirthdayPublic: false,
          ...data,
          id: uuidv4(),
          joinedAt: new Date().toISOString(),
        } as Member;
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
      updateMinistryMember: (id, updates) => set((state) => ({
        ministryMembers: state.ministryMembers.map(mm => mm.id === id ? { ...mm, ...updates } : mm),
        lastUpdated: new Date().toISOString()
      })),
      setPositions: (positions) => set({ positions, lastUpdated: new Date().toISOString() }),
      addPosition: (data) => {
        const pos: Position = {
          ...data,
          id: uuidv4(),
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ positions: [...state.positions, pos], lastUpdated: new Date().toISOString() }));
        return pos;
      },
      updatePosition: (id, updates) => set((state) => ({
        positions: state.positions.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p),
        lastUpdated: new Date().toISOString()
      })),
      deactivatePosition: (id) => set((state) => ({
        positions: state.positions.map(p => p.id === id ? { ...p, active: false, updatedAt: new Date().toISOString() } : p),
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
        if (state.members.length > 0 || state.positions.length > 0) return;
        const nowStr = new Date().toISOString();
        // Seed Positions
        const seedPositions: Position[] = [
          // Church Scope
          { id: 'pos-p', name: 'Pastor', description: 'Liderança espiritual geral', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-d', name: 'Diácono', description: 'Serviço e auxílio nas atividades', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-s', name: 'Secretário(a)', description: 'Gestão documental e registros', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-t', name: 'Tesoureiro(a)', description: 'Gestão financeira e balanços', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-p-m', name: 'Presbítero', description: 'Conselho e doutrina', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
          // Ministry Scope
          { id: 'pos-l-l', name: 'Líder de Louvor', description: 'Coordenação da equipe de música', scope: 'ministry', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-i', name: 'Instrumentista', description: 'Músico da equipe', scope: 'ministry', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-m-k', name: 'Monitor Kids', description: 'Ensino bíblico infantil', scope: 'ministry', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-v', name: 'Vocalista', description: 'Backing vocal ou solista', scope: 'ministry', active: true, createdAt: nowStr, updatedAt: nowStr },
          { id: 'pos-o-s', name: 'Operador de Som', description: 'Suporte técnico e áudio', scope: 'ministry', active: true, createdAt: nowStr, updatedAt: nowStr },
        ];
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
            positions: ['pos-p'],
            joinedAt: nowStr,
            memberStatus: "ativo",
            city: "São Paulo",
            state: "SP"
          },
          {
            id: m2Id,
            fullName: "Maria Oliveira",
            email: "maria@example.com",
            phone: "11888887777",
            photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
            birthDate: "1992-08-22",
            role: "Líder de Louvor",
            positions: ['pos-d'],
            joinedAt: nowStr,
            memberStatus: "ativo",
            city: "Rio de Janeiro",
            state: "RJ"
          }
        ];
        const seedMinistries: Ministry[] = [
          { id: min1Id, name: "Louvor & Adoração", description: "Equipe de música", leaderId: m2Id },
          { id: min2Id, name: "Kids", description: "Ministério infantil" }
        ];
        const seedMM: MinistryMember[] = [
          { id: uuidv4(), memberId: m2Id, ministryId: min1Id, role: 'leader', positionId: 'pos-l-l' },
          { id: uuidv4(), memberId: m1Id, ministryId: min2Id, role: 'member', positionId: 'pos-m-k' }
        ];
        set({
          positions: seedPositions,
          members: seedMembers,
          ministries: seedMinistries,
          ministryMembers: seedMM,
          lastUpdated: nowStr
        });
      }
    }),
    { name: 'churchflow-local-storage-v2' }
  )
);