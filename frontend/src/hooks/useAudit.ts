import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "../services/audit.service";
import { QUERY_KEYS } from "../lib/constants";

export const useAudit = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.AUDIT,
    queryFn: () => auditService.getAudit(),
  });
};

export const useCreateAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => auditService.createAudit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.AUDIT });
    },
  });
};
