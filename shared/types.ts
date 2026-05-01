export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pastor' | 'staff';
}
export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  birthDate: string; // ISO
  baptismDate?: string; // ISO
  role: string;
  joinedAt: string; // ISO
}
export interface Ministry {
  id: string;
  name: string;
  description: string;
  leaderId?: string; // Member ID
}
export interface MinistryMember {
  id: string;
  memberId: string;
  ministryId: string;
  role: 'leader' | 'member';
}
export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  time: string; // HH:mm
  location: string;
  category: 'culto' | 'ensaio' | 'reuniao' | 'social';
}
export type FinanceType = 'tithe' | 'offering' | 'donation';
export interface FinancialRecord {
  id: string;
  memberId?: string; // Optional for anonymous offerings
  amount: number;
  date: string; // ISO
  type: FinanceType;
  category: string;
  description: string;
}
export interface FinancialStats {
  totalMonth: number;
  lastMonth: number;
  growth: number;
  distribution: { name: string; value: number }[];
  history: { date: string; amount: number }[];
}
export interface DashboardStats {
  totalMembers: number;
  totalMinistries: number;
  growthData: { month: string; count: number }[];
  upcomingEvents: ChurchEvent[];
}