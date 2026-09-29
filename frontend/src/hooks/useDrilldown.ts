import { useQuery } from "@tanstack/react-query";
import { drilldownService, DrilldownQueryParams } from "../services/drilldown.service";
import { QUERY_KEYS } from "../lib/constants";

export const useDrilldown = (params: DrilldownQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.DRILLDOWN.ALL, params],
    queryFn: () => drilldownService.getDrilldown(params),
  });
};
