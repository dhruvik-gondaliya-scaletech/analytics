import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insightsService } from '../services/insights.service';
import type { CreateInsightPayload } from '../services/insights.service';
import type { SavedInsight } from '../types';

export const INSIGHTS_QUERY_KEY = ['insights'] as const;

export function useInsights() {
  const queryClient = useQueryClient();

  const query = useQuery<SavedInsight[]>({
    queryKey: INSIGHTS_QUERY_KEY,
    queryFn: () => insightsService.getInsights(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateInsightPayload) => insightsService.createInsight(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSIGHTS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => insightsService.deleteInsight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSIGHTS_QUERY_KEY });
    },
  });

  return {
    insights: query.data || [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    createInsight: createMutation.mutateAsync,
    deleteInsight: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
