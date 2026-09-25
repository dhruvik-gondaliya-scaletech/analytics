import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { EventExplorerPage } from './pages/EventExplorerPage';
import { EventRegistryPage } from './pages/EventRegistryPage';
import { FunnelsPage } from './pages/FunnelsPage';
import { RetentionPage } from './pages/RetentionPage';
import { InsightsPage } from './pages/InsightsPage';
import { DashboardsPage } from './pages/DashboardsPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1417] flex items-center justify-center text-slate-400 text-sm font-mono">
        Loading Analytics Platform...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/overview':
      case '/':
        return { title: 'Product Overview & Key Metrics', subtitle: 'Real-time aggregated health metrics and activity trends' };
      case '/explorer':
        return { title: 'Events Explorer', subtitle: 'Search and inspect raw analytics event payloads' };
      case '/registry':
        return { title: 'Event Registry & Data Dictionary', subtitle: 'Schema management and automatic event discovery' };
      case '/funnels':
        return { title: 'Conversion Funnel Analysis', subtitle: 'Step-by-step user conversion and drop-off analysis' };
      case '/retention':
        return { title: 'Cohort Retention Analysis', subtitle: 'Day 0 to Day 30 returning activity heatmap' };
      case '/insights':
        return { title: 'Saved Insights', subtitle: 'Reusable analytical queries and report configurations' };
      case '/dashboards':
        return { title: 'Custom Dashboards', subtitle: 'Customizable layout widgets for operational monitoring' };
      case '/settings':
        return { title: 'Platform Settings & Access', subtitle: 'Manage write keys, dashboard users, and retention policy' };
      default:
        return { title: 'Overview', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#0b1417] text-[#f1f5f9] font-sans selection:bg-[#4a7c8f] selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/explorer" element={<EventExplorerPage />} />
            <Route path="/registry" element={<EventRegistryPage />} />
            <Route path="/funnels" element={<FunnelsPage />} />
            <Route path="/retention" element={<RetentionPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/dashboards" element={<DashboardsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1417] flex items-center justify-center text-slate-400 text-sm font-mono">
        Loading Analytics Platform...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              }
            />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

