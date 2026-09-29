import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class TrendService {
  private readonly logger = new Logger(TrendService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getEventTrend(eventName: string, startDate: string, endDate: string, interval: 'day' | 'hour' | 'minute' = 'day') {
    const client = this.clickhouseService.getClient();
    
    // Using a simplified query for MVP. Real query would handle timezones and precise intervals.
    let dateIntervalFormat = '%Y-%m-%d';
    if (interval === 'hour') dateIntervalFormat = '%Y-%m-%d %H:00:00';
    if (interval === 'minute') dateIntervalFormat = '%Y-%m-%d %H:%M:00';

    const query = `
      SELECT 
        formatDateTime(occurred_at, '${dateIntervalFormat}') as time_bucket,
        count(*) as count
      FROM events
      WHERE event_name = {eventName:String}
        AND occurred_at >= {startDate:DateTime}
        AND occurred_at <= {endDate:DateTime}
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `;

    try {
      const resultSet = await client.query({
        query,
        query_params: {
          eventName,
          startDate,
          endDate
        },
        format: 'JSONEachRow',
      });
      return await resultSet.json();
    } catch (error) {
      this.logger.error(`Error querying trend for event ${eventName}`, error);
      throw error;
    }
  }
}
