import { useQuery } from "@tanstack/react-query";
import { statusService } from "../services/status.service";
import { QUERY_KEYS } from "../lib/constants";

export const useStatus = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM.STATUS,
    queryFn: () => statusService.getStatus(),
  });
};
