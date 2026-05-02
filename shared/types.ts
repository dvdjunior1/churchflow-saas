export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pastor' | 'staff' | 'member' | 'leader';
  memberId?: string;
}
export interface Position {
  id: string;
  name: string;
  description?: string;
  scope: 'church' | 'ministry';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  birthDate: string; // ISO
  baptismDate?: string; // ISO
  role: string; // Legacy field, keeping for compat
  positions?: string[]; // Array of Position IDs (church scope)
  joinedAt: string; // ISO
  whatsapp?: string;
  alternatePhone?: string;
  gender?: 'M' | 'F' | 'O';
  maritalStatus?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo';
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  memberStatus?: 'ativo' | 'inativo' | 'visitante' | 'transferido';
  notes?: string;
  showBirthdayPublic?: boolean;
  // System Access Fields
  hasAccess?: boolean;
  accessEmail?: string;
  accessPassword?: string;
  accessRole?: 'admin' | 'leader' | 'member';
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
  positionId?: string; // Specific role within this ministry
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
  description?: string;
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
export type ActivityType = 'event' | 'meeting' | 'visit' | 'project' | 'service' | 'other';
export type ActivityStatus = 'planned' | 'in_progress' | 'completed' | 'canceled';
export type StepStatus = 'pending' | 'in_progress' | 'completed';
export interface Activity {
  id: string;
  title: string;
  description: string;
  ministryId: string;
  responsibleMemberId: string;
  visibility: 'public' | 'private';
  type: ActivityType;
  status: ActivityStatus;
  startDate: string;
  endDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface ActivityStep {
  id: string;
  activityId: string;
  title: string;
  description?: string;
  responsibleMemberId: string;
  dueDate: string;
  status: StepStatus;
  createdAt: string;
  updatedAt: string;
}