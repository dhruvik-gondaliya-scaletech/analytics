import { useMutation } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import type { FunnelPayload } from '../services/analytics.service';
import type { FunnelData } from '../types';

export function useFunnels() {
  const mutation = useMutation<FunnelData, Error, FunnelPayload>({
    mutationFn: (payload: FunnelPayload) => analyticsService.calculateFunnel(payload),
  });

  return {
    funnelData: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
    calculateFunnel: mutation.mutateAsync,
  };
}
