import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userprofileService } from "../services/userprofile.service";
import { QUERY_KEYS } from "../lib/constants";

export const useUserprofile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.USERPROFILE,
    queryFn: () => userprofileService.getUserprofile(),
  });
};

export const useCreateUserprofile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => userprofileService.createUserprofile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.USERPROFILE });
    },
  });
};
