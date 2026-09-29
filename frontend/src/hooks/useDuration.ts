import { useQuery } from "@tanstack/react-query";
import { durationService, DurationQueryParams } from "../services/duration.service";
import { QUERY_KEYS } from "../lib/constants";

export const useDuration = (params: DurationQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.DURATION.ALL, params],
    queryFn: () => durationService.getDuration(params),
  });
};
