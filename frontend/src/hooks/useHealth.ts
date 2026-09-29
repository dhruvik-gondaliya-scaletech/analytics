import { useQuery } from "@tanstack/react-query";
import { healthService } from "../services/health.service";
import { QUERY_KEYS } from "../lib/constants";

export const useHealth = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM.HEALTH,
    queryFn: () => healthService.getHealth(),
  });
};
