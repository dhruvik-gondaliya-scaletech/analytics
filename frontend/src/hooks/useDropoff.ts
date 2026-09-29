import { useQuery } from "@tanstack/react-query";
import { dropoffService, DropoffQueryParams } from "../services/dropoff.service";
import { QUERY_KEYS } from "../lib/constants";

export const useDropoff = (params: DropoffQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.DROPOFF.ALL, params],
    queryFn: () => dropoffService.getDropoff(params),
  });
};
