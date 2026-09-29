import { useQuery } from "@tanstack/react-query";
import { conversionService, ConversionQueryParams } from "../services/conversion.service";
import { QUERY_KEYS } from "../lib/constants";

export const useConversion = (params: ConversionQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONVERSION.ALL, params],
    queryFn: () => conversionService.getConversion(params),
  });
};
