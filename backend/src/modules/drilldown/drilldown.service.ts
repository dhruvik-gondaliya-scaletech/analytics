import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class DrilldownService {
  private readonly logger = new Logger(DrilldownService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getDrilldown(startDate: string, endDate: string) {
    const client = this.clickhouseService.getClient();
    
    // Default placeholder query for drilldown
    const query = `
      SELECT count(*) as count, toDate(occurred_at) as date
      FROM events
      WHERE occurred_at >= {startDate:DateTime}
        AND occurred_at <= {endDate:DateTime}
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
      this.logger.error(`Error querying drilldown`, error);
      throw error;
    }
  }
}
