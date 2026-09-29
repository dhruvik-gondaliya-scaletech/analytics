import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class DurationService {
  private readonly logger = new Logger(DurationService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getDuration(startDate: string, endDate: string) {
    const client = this.clickhouseService.getClient();
    
    // Default placeholder query for duration
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
      this.logger.error(`Error querying duration`, error);
      throw error;
    }
  }
}
