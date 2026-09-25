import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardsService } from '../services/dashboards.service';
import type { CreateDashboardPayload } from '../services/dashboards.service';
import type { Dashboard } from '../types';

export const DASHBOARDS_QUERY_KEY = ['dashboards'] as const;

export function useDashboards() {
  const queryClient = useQueryClient();
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);

  const query = useQuery<Dashboard[]>({
    queryKey: DASHBOARDS_QUERY_KEY,
    queryFn: () => dashboardsService.getDashboards(),
  });

  useEffect(() => {
    if (query.data && query.data.length > 0 && !activeDashboard) {
      setActiveDashboard(query.data[0]);
    }
  }, [query.data, activeDashboard]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateDashboardPayload) => dashboardsService.createDashboard(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARDS_QUERY_KEY });
      setActiveDashboard(created);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dashboardsService.deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARDS_QUERY_KEY });
    },
  });

  return {
    dashboards: query.data || [],
    activeDashboard,
    setActiveDashboard,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    createDashboard: createMutation.mutateAsync,
    deleteDashboard: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
