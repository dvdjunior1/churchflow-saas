import React from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from '@/lib/auth-store';
import { AppLayout } from '@/components/layout/AppLayout';
export const AuthGuard = () => {
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMemberRoute = location.pathname.startsWith('/member');
  const isPrivileged = ['admin', 'pastor', 'staff'].includes(user.role);
  const isMember = user.role === 'member';
  // Cross-role protection
  if (isAdminRoute && !isPrivileged) {
    return <Navigate to="/member/dashboard" replace />;
  }
  if (isMemberRoute && !isMember && !isPrivileged) {
    return <Navigate to="/admin" replace />;
  }
  // Use AppLayout for everyone but adjust sidebar based on role inside AppLayout/Sidebar
  return (
    <AppLayout container>
      <Outlet />
    </AppLayout>
  );
};