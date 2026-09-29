import { useQuery } from "@tanstack/react-query";
import { sessionService, SessionQueryParams } from "../services/session.service";
import { QUERY_KEYS } from "../lib/constants";

export const useSession = (params: SessionQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.SESSION.ALL, params],
    queryFn: () => sessionService.getSession(params),
  });
};
