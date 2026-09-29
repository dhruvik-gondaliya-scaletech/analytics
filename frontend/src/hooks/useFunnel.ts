import { useQuery } from "@tanstack/react-query";
import { funnelService, FunnelQueryParams } from "../services/funnel.service";
import { QUERY_KEYS } from "../lib/constants";

export const useFunnel = (params: FunnelQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.FUNNEL.ALL, params],
    queryFn: () => funnelService.getFunnel(params),
  });
};
