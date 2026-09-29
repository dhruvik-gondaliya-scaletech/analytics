import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { acquisitionService } from "../services/acquisition.service";
import { QUERY_KEYS } from "../lib/constants";

export const useAcquisition = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.ACQUISITION,
    queryFn: () => acquisitionService.getAcquisition(),
  });
};

export const useCreateAcquisition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => acquisitionService.createAcquisition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.ACQUISITION });
    },
  });
};
