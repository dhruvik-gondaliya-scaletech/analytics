import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsconfigService } from "../services/analyticsconfig.service";
import { QUERY_KEYS } from "../lib/constants";

export const useAnalyticsconfig = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.ANALYTICSCONFIG,
    queryFn: () => analyticsconfigService.getAnalyticsconfig(),
  });
};

export const useCreateAnalyticsconfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => analyticsconfigService.createAnalyticsconfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANAGEMENT.ANALYTICSCONFIG });
    },
  });
};
