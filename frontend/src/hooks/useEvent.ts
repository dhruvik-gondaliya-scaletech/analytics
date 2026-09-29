import { useQuery } from "@tanstack/react-query";
import { eventService, EventQueryParams } from "../services/event.service";
import { QUERY_KEYS } from "../lib/constants";

export const useEvent = (params: EventQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENT.ALL, params],
    queryFn: () => eventService.getEvent(params),
  });
};
