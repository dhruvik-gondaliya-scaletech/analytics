import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { identityService } from "../services/identity.service";
import { QUERY_KEYS } from "../lib/constants";

export const useIdentity = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.IDENTITY,
    queryFn: () => identityService.getIdentity(),
  });
};

export const useCreateIdentity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => identityService.createIdentity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.IDENTITY });
    },
  });
};
