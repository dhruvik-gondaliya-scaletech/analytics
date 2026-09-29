import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class ComparisonService {
  private readonly logger = new Logger(ComparisonService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getComparison(eventName: string, baseStartDate: string, baseEndDate: string, compareStartDate: string, compareEndDate: string) {
    const client = this.clickhouseService.getClient();
    
    const query = `
      SELECT 
        'base' as period,
        count(*) as count
      FROM analytics_events
      WHERE event_name = {eventName:String}
        AND timestamp >= {baseStartDate:DateTime}
        AND timestamp <= {baseEndDate:DateTime}
      UNION ALL
      SELECT 
        'compare' as period,
        count(*) as count
      FROM analytics_events
      WHERE event_name = {eventName:String}
        AND timestamp >= {compareStartDate:DateTime}
        AND timestamp <= {compareEndDate:DateTime}
    `;

    try {
      const resultSet = await client.query({
        query,
        query_params: {
          eventName,
          baseStartDate,
          baseEndDate,
          compareStartDate,
          compareEndDate
        },
        format: 'JSONEachRow',
      });
      return await resultSet.json();
    } catch (error) {
      this.logger.error(`Error querying comparison for event ${eventName}`, error);
      throw error;
    }
  }
}
