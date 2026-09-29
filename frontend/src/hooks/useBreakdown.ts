import { useQuery } from "@tanstack/react-query";
import { breakdownService, BreakdownQueryParams } from "../services/breakdown.service";
import { QUERY_KEYS } from "../lib/constants";

export const useBreakdown = (params: BreakdownQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.BREAKDOWN.ALL, params],
    queryFn: () => breakdownService.getBreakdown(params),
  });
};
