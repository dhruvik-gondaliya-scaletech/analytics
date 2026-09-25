import { useMutation } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import type { RetentionPayload } from '../services/analytics.service';
import type { RetentionData } from '../types';

export function useRetention() {
  const mutation = useMutation<RetentionData, Error, RetentionPayload>({
    mutationFn: (payload: RetentionPayload) => analyticsService.calculateRetention(payload),
  });

  return {
    retentionData: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
    calculateRetention: mutation.mutateAsync,
  };
}
