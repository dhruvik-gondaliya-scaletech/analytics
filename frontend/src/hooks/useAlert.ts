import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertService } from "../services/alert.service";
import { QUERY_KEYS } from "../lib/constants";

export const useAlert = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.ALERT,
    queryFn: () => alertService.getAlert(),
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => alertService.createAlert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.ALERT });
    },
  });
};
