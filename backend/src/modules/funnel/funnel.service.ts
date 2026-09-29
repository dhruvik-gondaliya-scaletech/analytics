import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class FunnelService {
  private readonly logger = new Logger(FunnelService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getFunnel(steps: string[], startDate: string, endDate: string, windowMinutes: number = 60) {
    if (!steps || steps.length < 2) {
      throw new Error('Funnel requires at least 2 steps');
    }
    const client = this.clickhouseService.getClient();
    
    // Using windowFunnel from Clickhouse
    // windowFunnel(window)(timestamp, cond1, cond2, ...)
    
    const conditions = steps.map((step, index) => `event_name = {step${index}:String}`).join(', ');
    const queryParams: Record<string, string> = {
      startDate,
      endDate
    };
    steps.forEach((step, index) => {
      queryParams[`step${index}`] = step;
    });

    const query = `
      SELECT 
        level,
        count(*) as count
      FROM (
        SELECT 
          user_id,
          windowFunnel(${windowMinutes * 60})(
            occurred_at,
            ${conditions}
          ) as level
        FROM analytics_events
        WHERE occurred_at >= {startDate:DateTime}
          AND occurred_at <= {endDate:DateTime}
        GROUP BY user_id
      )
      GROUP BY level
      ORDER BY level ASC
    `;

    try {
      const resultSet = await client.query({
        query,
        query_params: queryParams,
        format: 'JSONEachRow',
      });
      return await resultSet.json();
    } catch (error) {
      this.logger.error(`Error querying funnel`, error);
      throw error;
    }
  }
}
