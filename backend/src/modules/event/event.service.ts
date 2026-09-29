import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getEvent(startDate: string, endDate: string) {
    const client = this.clickhouseService.getClient();
    
    // Default placeholder query for event
    const query = `
      SELECT count(*) as count, toDate(timestamp) as date
      FROM analytics_events
      WHERE timestamp >= {startDate:DateTime}
        AND timestamp <= {endDate:DateTime}
      GROUP BY date
      ORDER BY date ASC
    `;

    try {
      const resultSet = await client.query({
        query,
        query_params: { startDate, endDate },
        format: 'JSONEachRow',
      });
      return await resultSet.json();
    } catch (error) {
      this.logger.error(`Error querying event`, error);
      throw error;
    }
  }
}
