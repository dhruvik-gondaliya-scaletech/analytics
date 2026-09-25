import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import type { OverviewData } from '../types';

export const OVERVIEW_QUERY_KEY = ['analytics', 'overview'] as const;

export function useOverview() {
  const query = useQuery<OverviewData>({
    queryKey: OVERVIEW_QUERY_KEY,
    queryFn: () => analyticsService.getOverview(),
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
