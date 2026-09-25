import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import type { GetEventsParams, EventsResponse } from '../services/analytics.service';

export function useEventExplorer(initialParams?: GetEventsParams) {
  const [params, setParams] = useState<GetEventsParams>(initialParams || { page: 1, limit: 25 });

  const query = useQuery<EventsResponse>({
    queryKey: ['analytics', 'events', params],
    queryFn: () => analyticsService.getEvents(params),
  });

  const fetchEvents = useCallback((newParams?: GetEventsParams) => {
    if (newParams) {
      setParams(newParams);
    }
  }, []);

  const getExportCsvUrl = useCallback((exportParams?: GetEventsParams) => {
    return analyticsService.getExportCsvUrl(exportParams || params);
  }, [params]);

  return {
    events: query.data?.items || [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    totalPages: query.data?.pagination?.total_pages || 1,
    error: query.error ? (query.error as Error).message : null,
    fetchEvents,
    getExportCsvUrl,
    refetch: query.refetch,
  };
}
