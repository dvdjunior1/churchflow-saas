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
export interface DashboardStats {
  totalMembers: number;
  totalMinistries: number;
  growthData: { month: string; count: number }[];
}