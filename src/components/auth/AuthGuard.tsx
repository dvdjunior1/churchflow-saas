import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from '@/lib/auth-store';
import { AppLayout } from '@/components/layout/AppLayout';
export const AuthGuard = () => {
  const user = useAuthStore(s => s.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppLayout container>
      <Outlet />
    </AppLayout>
  );
};