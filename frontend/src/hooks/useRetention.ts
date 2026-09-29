import { useQuery } from "@tanstack/react-query";
import { retentionService, RetentionQueryParams } from "../services/retention.service";
import { QUERY_KEYS } from "../lib/constants";

export const useRetention = (params: RetentionQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.RETENTION.ALL, params],
    queryFn: () => retentionService.getRetention(params),
  });
};
