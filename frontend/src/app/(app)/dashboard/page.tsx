"use client";

import { useDashboards } from "@/hooks/useDashboards";
import DashboardView from "@/features/dashboard/components/DashboardView";

// Smart Component: Handles data fetching, state management, and passing props
export default function DashboardPage() {
  const { data: dashboards, isLoading, isError, error } = useDashboards();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading dashboard data...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-destructive">
        Error loading dashboards: {error?.message || "Unknown error"}
      </div>
    );
  }

  return <DashboardView dashboards={dashboards || []} />;
}
