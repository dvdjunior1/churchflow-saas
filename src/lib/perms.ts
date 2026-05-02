import { useDataStore } from './data-store';
import type { AuthUser } from '@shared/types';
export type Resource = 
  | 'dashboard' 
  | 'members' 
  | 'ministries' 
  | 'positions' 
  | 'activities' 
  | 'events' 
  | 'finance' 
  | 'reports' 
  | 'profile' 
  | 'settings';
/**
 * Checks if a member is a leader in a specific ministry.
 */
export function isLeaderInMin(ministryId: string | undefined, memberId: string | undefined): boolean {
  if (!ministryId || !memberId) return false;
  const state = useDataStore.getState();
  return state.ministryMembers.some(
    mm => mm.ministryId === ministryId && mm.memberId === memberId && mm.role === 'leader'
  );
}
/**
 * Centralized RBAC logic.
 */
export function canAccess(user: AuthUser | null, resource: Resource, resourceId?: string): boolean {
  if (!user) return false;
  const { role } = user;
  // Administrators have god-mode
  if (role === 'admin' || role === 'pastor') return true;
  // Leadership permissions (Ministry Leaders)
  if (role === 'leader') {
    const allowed: Resource[] = ['dashboard', 'members', 'ministries', 'activities', 'events', 'profile'];
    // Global block for sensitive modules
    if (!allowed.includes(resource)) return false;
    // Resource-specific ownership checks (if ID is provided)
    if (resource === 'ministries' && resourceId) {
      return isLeaderInMin(resourceId, user.memberId);
    }
    return true;
  }
  // Regular Member permissions
  if (role === 'member') {
    const allowed: Resource[] = ['dashboard', 'profile', 'events'];
    return allowed.includes(resource);
  }
  return false;
}
/**
 * Helper to get all ministry IDs where the user is a leader.
 */
export function getManagedMinistryIds(memberId: string | undefined): string[] {
  if (!memberId) return [];
  const state = useDataStore.getState();
  return state.ministryMembers
    .filter(mm => mm.memberId === memberId && mm.role === 'leader')
    .map(mm => mm.ministryId);
}