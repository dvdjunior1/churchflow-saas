import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { MembersPage } from '@/pages/admin/MembersPage'
import { MinistriesPage } from '@/pages/admin/MinistriesPage'
import { FinancialPage } from '@/pages/admin/FinancialPage'
import { EventsPage } from '@/pages/admin/EventsPage'
import ReportsPage from '@/pages/admin/ReportsPage'
import MemberDashboardPage from '@/pages/member/MemberDashboardPage'
import { AuthGuard } from '@/components/auth/AuthGuard'
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
      { path: "finance", element: <FinancialPage /> },
      { path: "events", element: <EventsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "profile", element: <div className="p-8">Página de Perfil (Admin)</div> },
    ]
  },
  {
    path: "/member",
    element: <AuthGuard />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "dashboard", element: <MemberDashboardPage /> },
      { path: "donations", element: <div className="p-8">Histórico de Contribuições Detalhado</div> },
      { path: "profile", element: <div className="p-8">Página de Perfil (Membro)</div> },
    ]
  }
]);
declare global {
  interface Window {
    __reactRoot?: Root;
  }
}
const container = document.getElementById('root')!;
if (!window.__reactRoot) {
  window.__reactRoot = createRoot(container);
}
window.__reactRoot.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);