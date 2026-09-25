import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registryService } from '../services/registry.service';
import type { EventDefinition } from '../types';

export const REGISTRY_QUERY_KEY = ['registry', 'events'] as const;

export function useEventRegistry() {
  const queryClient = useQueryClient();

  const query = useQuery<EventDefinition[]>({
    queryKey: REGISTRY_QUERY_KEY,
    queryFn: () => registryService.getEvents(),
  });

  const deprecateMutation = useMutation({
    mutationFn: (eventName: string) => registryService.deprecateEvent(eventName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGISTRY_QUERY_KEY });
    },
  });

  return {
    events: query.data || [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    deprecateEvent: deprecateMutation.mutateAsync,
    isDeprecating: deprecateMutation.isPending,
  };
}
