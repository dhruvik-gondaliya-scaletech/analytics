import { useQuery } from "@tanstack/react-query";
import { comparisonService, ComparisonQueryParams } from "../services/comparison.service";
import { QUERY_KEYS } from "../lib/constants";

export const useComparison = (params: ComparisonQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.COMPARISON.ALL, params],
    queryFn: () => comparisonService.getComparison(params),
  });
};
