import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface ConversionQueryParams {
  startDate: string;
  endDate: string;
}

class ConversionService {
  async getConversion(params: ConversionQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.CONVERSION.BASE, {
      params,
    });
    return response.data?.data || response.data || [];
  }
}

export const conversionService = new ConversionService();
