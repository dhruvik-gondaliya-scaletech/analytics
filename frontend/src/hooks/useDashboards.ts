import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardService, CreateDashboardPayload } from "../services/dashboard.service";
import { QUERY_KEYS } from "../lib/constants";

export const useDashboards = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARDS.ALL,
    queryFn: () => dashboardService.getDashboards(),
  });
};

export const useDashboard = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARDS.DETAIL(id),
    queryFn: () => dashboardService.getDashboard(id),
    enabled: !!id,
  });
};

export const useCreateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDashboardPayload) => dashboardService.createDashboard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS.ALL });
    },
  });
};
