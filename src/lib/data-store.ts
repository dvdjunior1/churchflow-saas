import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { Member, Ministry, MinistryMember, FinancialRecord, ChurchEvent, Position, Activity, ActivityStep } from '@shared/types';
interface DataState {
  members: Member[];
  ministries: Ministry[];
  ministryMembers: MinistryMember[];
  financialRecords: FinancialRecord[];
  events: ChurchEvent[];
  positions: Position[];
  activities: Activity[];
  activitySteps: ActivityStep[];
  lastUpdated: string;
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
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addActivityStep: (step: Omit<ActivityStep, 'id' | 'createdAt' | 'updatedAt'>) => ActivityStep;
  updateActivityStep: (id: string, updates: Partial<ActivityStep>) => void;
  deleteActivityStep: (id: string) => void;
  seedIfEmpty: () => void;
}
const STORAGE_KEY = 'churchflow-data-v1';
const LEGACY_KEY = 'churchflow-local-storage-v21';
// Migration helper: Move data from legacy key to new key if it exists
const migrateLegacyData = () => {
  if (typeof window === 'undefined') return;
  const legacy = localStorage.getItem(LEGACY_KEY);
  const current = localStorage.getItem(STORAGE_KEY);
  if (legacy && !current) {
    localStorage.setItem(STORAGE_KEY, legacy);
    console.warn('Migration: Legacy data moved to churchflow-data-v1');
  }
};
migrateLegacyData();
export const useDataStore = create<DataState>()(
  persist(
    immer((set, get) => ({
      members: [],
      ministries: [],
      ministryMembers: [],
      financialRecords: [],
      events: [],
      positions: [],
      activities: [],
      activitySteps: [],
      lastUpdated: new Date().toISOString(),
      setMembers: (members) => set((state) => {
        state.members = members;
        state.lastUpdated = new Date().toISOString();
      }),
      addMember: (data) => {
        const id = uuidv4();
        const member: Member = {
          fullName: "",
          email: "",
          phone: "",
          photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
          birthDate: "",
          role: "Membro",
          positions: [],
          memberStatus: "ativo",
          showBirthdayPublic: false,
          ...data,
          id,
          joinedAt: new Date().toISOString(),
        } as Member;
        set((state) => {
          state.members.push(member);
          state.lastUpdated = new Date().toISOString();
        });
        return member;
      },
      updateMember: (id, updates) => set((state) => {
        const index = state.members.findIndex(m => m.id === id);
        if (index !== -1) {
          state.members[index] = { ...state.members[index], ...updates };
          state.lastUpdated = new Date().toISOString();
        }
      }),
      deleteMember: (id) => set((state) => {
        state.members = state.members.filter(m => m.id !== id);
        state.ministryMembers = state.ministryMembers.filter(mm => mm.memberId !== id);
        state.activitySteps = state.activitySteps.filter(s => s.responsibleMemberId !== id);
        state.lastUpdated = new Date().toISOString();
      }),
      setMinistries: (ministries) => set((state) => {
        state.ministries = ministries;
        state.lastUpdated = new Date().toISOString();
      }),
      addMinistry: (data) => {
        const ministry: Ministry = { ...data, id: uuidv4() };
        set((state) => {
          state.ministries.push(ministry);
          state.lastUpdated = new Date().toISOString();
        });
        return ministry;
      },
      updateMinistry: (id, updates) => set((state) => {
        const index = state.ministries.findIndex(m => m.id === id);
        if (index !== -1) {
          state.ministries[index] = { ...state.ministries[index], ...updates };
          state.lastUpdated = new Date().toISOString();
        }
      }),
      deleteMinistry: (id) => set((state) => {
        state.ministries = state.ministries.filter(m => m.id !== id);
        state.ministryMembers = state.ministryMembers.filter(mm => mm.ministryId !== id);
        state.activities = state.activities.filter(a => a.ministryId !== id);
        state.lastUpdated = new Date().toISOString();
      }),
      setMinistryMembers: (items) => set((state) => {
        state.ministryMembers = items;
        state.lastUpdated = new Date().toISOString();
      }),
      linkMember: (data) => {
        const mm: MinistryMember = { ...data, id: uuidv4() };
        set((state) => {
          state.ministryMembers.push(mm);
          state.lastUpdated = new Date().toISOString();
        });
        return mm;
      },
      unlinkMember: (id) => set((state) => {
        state.ministryMembers = state.ministryMembers.filter(mm => mm.id !== id);
        state.lastUpdated = new Date().toISOString();
      }),
      updateMinistryMember: (id, updates) => set((state) => {
        const index = state.ministryMembers.findIndex(mm => mm.id === id);
        if (index !== -1) {
          state.ministryMembers[index] = { ...state.ministryMembers[index], ...updates };
          state.lastUpdated = new Date().toISOString();
        }
      }),
      setPositions: (positions) => set((state) => {
        state.positions = positions;
        state.lastUpdated = new Date().toISOString();
      }),
      addPosition: (data) => {
        const pos: Position = {
          name: data.name,
          scope: data.scope,
          description: data.description,
          id: uuidv4(),
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => {
          state.positions.push(pos);
          state.lastUpdated = new Date().toISOString();
        });
        return pos;
      },
      updatePosition: (id, updates) => set((state) => {
        const index = state.positions.findIndex(p => p.id === id);
        if (index !== -1) {
          state.positions[index] = { 
            ...state.positions[index], 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
          state.lastUpdated = new Date().toISOString();
        }
      }),
      deactivatePosition: (id) => set((state) => {
        const index = state.positions.findIndex(p => p.id === id);
        if (index !== -1) {
          state.positions[index].active = false;
          state.positions[index].updatedAt = new Date().toISOString();
          state.lastUpdated = new Date().toISOString();
        }
      }),
      setFinancialRecords: (records) => set((state) => {
        state.financialRecords = records;
        state.lastUpdated = new Date().toISOString();
      }),
      addFinancialRecord: (data) => {
        const record: FinancialRecord = { ...data, id: uuidv4() };
        set((state) => {
          state.financialRecords.unshift(record);
          state.lastUpdated = new Date().toISOString();
        });
        return record;
      },
      deleteFinancialRecord: (id) => set((state) => {
        state.financialRecords = state.financialRecords.filter(r => r.id !== id);
        state.lastUpdated = new Date().toISOString();
      }),
      setEvents: (events) => set((state) => {
        state.events = events;
        state.lastUpdated = new Date().toISOString();
      }),
      addEvent: (data) => {
        const event: ChurchEvent = { ...data, id: uuidv4() };
        set((state) => {
          state.events.push(event);
          state.lastUpdated = new Date().toISOString();
        });
        return event;
      },
      updateEvent: (id, updates) => set((state) => {
        const index = state.events.findIndex(e => e.id === id);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...updates };
          state.lastUpdated = new Date().toISOString();
        }
      }),
      deleteEvent: (id) => set((state) => {
        state.events = state.events.filter(e => e.id !== id);
        state.lastUpdated = new Date().toISOString();
      }),
      addActivity: (data) => {
        const activity: Activity = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => {
          state.activities.push(activity);
          state.lastUpdated = new Date().toISOString();
        });
        return activity;
      },
      updateActivity: (id, updates) => set((state) => {
        const index = state.activities.findIndex(a => a.id === id);
        if (index !== -1) {
          state.activities[index] = { 
            ...state.activities[index], 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
          state.lastUpdated = new Date().toISOString();
        }
      }),
      deleteActivity: (id) => set((state) => {
        state.activities = state.activities.filter(a => a.id !== id);
        state.activitySteps = state.activitySteps.filter(s => s.activityId !== id);
        state.lastUpdated = new Date().toISOString();
      }),
      addActivityStep: (data) => {
        const step: ActivityStep = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => {
          state.activitySteps.push(step);
          state.lastUpdated = new Date().toISOString();
        });
        return step;
      },
      updateActivityStep: (id, updates) => set((state) => {
        const index = state.activitySteps.findIndex(s => s.id === id);
        if (index !== -1) {
          state.activitySteps[index] = { 
            ...state.activitySteps[index], 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
          state.lastUpdated = new Date().toISOString();
        }
      }),
      deleteActivityStep: (id) => set((state) => {
        state.activitySteps = state.activitySteps.filter(s => s.id !== id);
        state.lastUpdated = new Date().toISOString();
      }),
      seedIfEmpty: () => {
        const nowStr = new Date().toISOString();
        set((state) => {
          // 1. Seed Positions independently
          if (state.positions.length === 0) {
            const seedPos: Position[] = [
              { id: 'pos-pastor', name: 'Pastor', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
              { id: 'pos-diacono', name: 'Diácono', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
              { id: 'pos-presbitero', name: 'Presbítero', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
              { id: 'pos-lider', name: 'Líder de Ministério', scope: 'ministry', active: true, createdAt: nowStr, updatedAt: nowStr },
              { id: 'pos-tesoureiro', name: 'Tesoureiro', scope: 'church', active: true, createdAt: nowStr, updatedAt: nowStr },
            ];
            state.positions = seedPos;
          }
          // 2. Seed Members independently
          if (state.members.length === 0) {
            const seedMembers: Member[] = [
              {
                id: 'm1',
                fullName: "João Silva",
                email: "joao@example.com",
                phone: "11999998888",
                photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
                birthDate: "1985-05-15",
                baptismDate: "2010-10-20",
                role: "Pastor",
                positions: ['pos-pastor'],
                joinedAt: nowStr,
                memberStatus: "ativo",
                city: "São Paulo",
                state: "SP"
              },
              {
                id: 'm2',
                fullName: "Maria Oliveira",
                email: "maria@example.com",
                phone: "11888887777",
                photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
                birthDate: "1992-08-22",
                role: "Líder de Louvor",
                positions: ['pos-lider'],
                joinedAt: nowStr,
                memberStatus: "ativo",
                city: "Rio de Janeiro",
                state: "RJ"
              }
            ];
            state.members = seedMembers;
          }
          // 3. Seed Ministries independently
          if (state.ministries.length === 0) {
            const seedMinistries: Ministry[] = [
              { id: 'min1', name: "Louvor & Adoração", description: "Equipe de música", leaderId: 'm2' },
              { id: 'min2', name: "Kids", description: "Ministério infantil" }
            ];
            state.ministries = seedMinistries;
          }
          // 4. Seed Activities independently
          if (state.activities.length === 0) {
            const a1Id = uuidv4();
            state.activities = [
              {
                id: a1Id,
                title: "Concerto de Primavera",
                description: "Evento musical aberto à comunidade.",
                ministryId: 'min1',
                responsibleMemberId: 'm2',
                visibility: 'public',
                type: 'event',
                status: 'in_progress',
                startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                createdAt: nowStr,
                updatedAt: nowStr
              }
            ];
            state.activitySteps = [
              {
                id: uuidv4(),
                activityId: a1Id,
                title: "Seleção do Repertório",
                responsibleMemberId: 'm2',
                dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                status: 'completed',
                createdAt: nowStr,
                updatedAt: nowStr
              }
            ];
          }
          state.lastUpdated = new Date().toISOString();
        });
      }
    })),
    { 
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);