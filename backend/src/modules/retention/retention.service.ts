import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getRetention(cohortEvent: string, returnEvent: string, startDate: string, endDate: string) {
    const client = this.clickhouseService.getClient();
    
    // retention function: retention(cond1, cond2, ...)
    // cond1 is the cohort event, cond2 is return event day 1, cond3 is return event day 2...
    // simplified: we'll just group by cohort date and calculate return rate on subsequent days
    const query = `
      SELECT 
        toDate(t1.occurred_at) as cohort_date,
        dateDiff('day', toDate(t1.occurred_at), toDate(t2.occurred_at)) as day_offset,
        uniqExact(t1.user_id) as users_count
      FROM events t1
      LEFT JOIN events t2 
        ON t1.user_id = t2.user_id 
        AND t2.event_name = {returnEvent:String}
        AND toDate(t2.occurred_at) >= toDate(t1.occurred_at)
      WHERE t1.event_name = {cohortEvent:String}
        AND t1.occurred_at >= {startDate:DateTime}
        AND t1.occurred_at <= {endDate:DateTime}
      GROUP BY cohort_date, day_offset
      ORDER BY cohort_date ASC, day_offset ASC
    `;

    try {
      const resultSet = await client.query({
        query,
        query_params: {
          cohortEvent,
          returnEvent,
          startDate,
          endDate
        },
        format: 'JSONEachRow',
      });
      return await resultSet.json();
    } catch (error) {
      this.logger.error(`Error querying retention`, error);
      throw error;
    }
  }
}
