import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { MembersPage } from '@/pages/admin/MembersPage';
import { MinistriesPage } from '@/pages/admin/MinistriesPage';
import { PositionsPage } from '@/pages/admin/PositionsPage';
import ProfilePage from '@/pages/shared/ProfilePage';
import { FinancialPage } from '@/pages/admin/FinancialPage';
import { EventsPage } from '@/pages/admin/EventsPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import { ActivitiesPage } from '@/pages/admin/ActivitiesPage';
import MemberDashboardPage from '@/pages/member/MemberDashboardPage';
import MemberDonationsPage from '@/pages/member/MemberDonationsPage';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useDataStore } from '@/lib/data-store';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <AuthGuard />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "members", element: <MembersPage /> },
      { path: "ministries", element: <MinistriesPage /> },
      { path: "positions", element: <PositionsPage /> },
      { path: "finance", element: <FinancialPage /> },
      { path: "events", element: <EventsPage /> },
      { path: "activities", element: <ActivitiesPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ]
  },
  {
    path: "/member",
    element: <AuthGuard />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "dashboard", element: <MemberDashboardPage /> },
      { path: "donations", element: <MemberDonationsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ]
  }
]);
export default function App() {
  const seedIfEmpty = useDataStore(s => s.seedIfEmpty);
  useEffect(() => {
    // Triggers granular seeding and migration logic on initial mount
    seedIfEmpty();
    console.info('ChurchFlow: Persistent Data Architecture initialized.');
  }, [seedIfEmpty]);
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}