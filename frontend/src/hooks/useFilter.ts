import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filterService } from "../services/filter.service";
import { QUERY_KEYS } from "../lib/constants";

export const useFilter = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.FILTER,
    queryFn: () => filterService.getFilter(),
  });
};

export const useCreateFilter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => filterService.createFilter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.FILTER });
    },
  });
};
