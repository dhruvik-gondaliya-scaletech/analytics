import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportService } from "../services/export.service";
import { QUERY_KEYS } from "../lib/constants";

export const useExport = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.EXPORT,
    queryFn: () => exportService.getExport(),
  });
};

export const useCreateExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => exportService.createExport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.EXPORT });
    },
  });
};
