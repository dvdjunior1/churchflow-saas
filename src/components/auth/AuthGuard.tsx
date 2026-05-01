import React from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { canAccess, Resource } from '@/lib/perms';
export const AuthGuard = () => {
  const user = useAuthStore(s => s.user);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const path = location.pathname;
  // Map paths to Resource types for permission checking
  let resource: Resource = 'dashboard';
  if (path.includes('/members')) resource = 'members';
  else if (path.includes('/ministries')) resource = 'ministries';
  else if (path.includes('/positions')) resource = 'positions';
  else if (path.includes('/activities')) resource = 'activities';
  else if (path.includes('/events')) resource = 'events';
  else if (path.includes('/finance')) resource = 'finance';
  else if (path.includes('/reports')) resource = 'reports';
  else if (path.includes('/profile')) resource = 'profile';
  const hasAccess = canAccess(user, ministryMembers, resource);
  if (!hasAccess) {
    // Redirect based on role fallback
    if (user.role === 'member') {
      return <Navigate to="/member/dashboard" replace />;
    }
    return <Navigate to="/admin" replace />;
  }
  return (
    <AppLayout container>
      <Outlet />
    </AppLayout>
  );
};