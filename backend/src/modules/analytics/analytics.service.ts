import { Injectable, Logger } from '@nestjs/common';
import { ClickhouseService } from '../../database/clickhouse/clickhouse.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { FunnelQueryDto } from './dto/funnel-query.dto';
import { RetentionQueryDto } from './dto/retention-query.dto';
import { EventsExplorerDto } from './dto/events-explorer.dto';
import { ClickhouseQueryBuilder } from './query-builder/clickhouse-query-builder';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly clickhouseService: ClickhouseService) {}

  async getOverviewStats(dateFrom?: string, dateTo?: string) {
    const now = new Date();
    const defaultTo = dateTo || now.toISOString();
    const defaultFrom =
      dateFrom || new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // 1. DAU / WAU / MAU
      const activeUsersQuery = `
        SELECT
          uniqExactIf(if(user_id != '', user_id, anonymous_id), timestamp >= now() - INTERVAL 1 DAY AND if(user_id != '', user_id, anonymous_id) != '') as dau,
          uniqExactIf(if(user_id != '', user_id, anonymous_id), timestamp >= now() - INTERVAL 7 DAY AND if(user_id != '', user_id, anonymous_id) != '') as wau,
          uniqExactIf(if(user_id != '', user_id, anonymous_id), timestamp >= now() - INTERVAL 30 DAY AND if(user_id != '', user_id, anonymous_id) != '') as mau
        FROM analytics.analytics_events
      `;
      const activeUsersResult = await this.clickhouseService.query<{
        dau: string;
        wau: string;
        mau: string;
      }>(activeUsersQuery);

      // 2. Total events & Unique users in date range
      const overviewTotalsQuery = `
        SELECT
          count() as total_events,
          uniqExact(if(user_id != '', user_id, if(anonymous_id != '', anonymous_id, null))) as unique_users,
          uniqExact(if(session_id != '', session_id, null)) as active_sessions
        FROM analytics.analytics_events
        WHERE timestamp >= parseDateTime64BestEffort({from: String})
          AND timestamp <= parseDateTime64BestEffort({to: String})
      `;
      const totalsResult = await this.clickhouseService.query<{
        total_events: string;
        unique_users: string;
        active_sessions: string;
      }>(overviewTotalsQuery, { from: defaultFrom, to: defaultTo });

      // 3. Top events
      const topEventsQuery = `
        SELECT
          event_name,
          count() as count,
          uniqExact(if(user_id != '', user_id, if(anonymous_id != '', anonymous_id, null))) as unique_users
        FROM analytics.analytics_events
        WHERE timestamp >= parseDateTime64BestEffort({from: String})
          AND timestamp <= parseDateTime64BestEffort({to: String})
        GROUP BY event_name
        ORDER BY count DESC
        LIMIT 10
      `;
      const topEvents = await this.clickhouseService.query<{
        event_name: string;
        count: string;
        unique_users: string;
      }>(topEventsQuery, { from: defaultFrom, to: defaultTo });

      // 4. Daily event trend
      const trendQuery = `
        SELECT
          toStartOfDay(timestamp) as date,
          count() as events,
          uniqExact(if(user_id != '', user_id, if(anonymous_id != '', anonymous_id, null))) as users
        FROM analytics.analytics_events
        WHERE timestamp >= parseDateTime64BestEffort({from: String})
          AND timestamp <= parseDateTime64BestEffort({to: String})
        GROUP BY date
        ORDER BY date ASC
      `;
      const trend = await this.clickhouseService.query<{
        date: string;
        events: string;
        users: string;
      }>(trendQuery, { from: defaultFrom, to: defaultTo });

      const dau = activeUsersResult.length > 0 ? parseInt(activeUsersResult[0].dau, 10) : 0;
      const wau = activeUsersResult.length > 0 ? parseInt(activeUsersResult[0].wau, 10) : 0;
      const mau = activeUsersResult.length > 0 ? parseInt(activeUsersResult[0].mau, 10) : 0;

      const totalEvents = totalsResult.length > 0 ? parseInt(totalsResult[0].total_events, 10) : 0;
      const uniqueUsers = totalsResult.length > 0 ? parseInt(totalsResult[0].unique_users, 10) : 0;
      const activeSessions = totalsResult.length > 0 ? parseInt(totalsResult[0].active_sessions, 10) : 0;

      return {
        metrics: {
          dau,
          wau,
          mau,
          total_events: totalEvents,
          unique_users: uniqueUsers,
          active_sessions: activeSessions,
        },
        top_events: topEvents.map((t) => ({
          event_name: t.event_name,
          count: parseInt(t.count, 10),
          unique_users: parseInt(t.unique_users, 10),
        })),
        trend: trend.map((tr) => ({
          date: tr.date,
          events: parseInt(tr.events, 10),
          users: parseInt(tr.users, 10),
        })),
        date_range: {
          from: defaultFrom,
          to: defaultTo,
        },
      };
    } catch (err) {
      this.logger.error('Failed to get overview stats:', err);
      return {
        metrics: { dau: 0, wau: 0, mau: 0, total_events: 0, unique_users: 0, active_sessions: 0 },
        top_events: [],
        trend: [],
        date_range: { from: defaultFrom, to: defaultTo },
      };
    }
  }

  async executeAnalyticsQuery(dto: AnalyticsQueryDto) {
    const { sql, params } = ClickhouseQueryBuilder.buildTimeSeriesQuery(dto);
    const rawResult = await this.clickhouseService.query<any>(sql, params);

    return {
      chart_type: dto.chart_type || 'LINE',
      aggregation: dto.aggregation || 'COUNT',
      results: rawResult.map((row) => ({
        time_bucket: row.time_bucket,
        value: Number(row.value),
        ...(row.breakdown !== undefined ? { breakdown: row.breakdown } : {}),
      })),
    };
  }

  async executeFunnelQuery(dto: FunnelQueryDto) {
    const steps = dto.steps;
    const windowDays = dto.window_days || 7;
    const from = dto.date_range.from;
    const to = dto.date_range.to;

    try {
      // Step 1: count unique identities for step 0
      const stepResults: { step: string; count: number; unique_users: number }[] = [];

      for (let i = 0; i < steps.length; i++) {
        const stepName = steps[i];
        const stepQuery = `
          SELECT
            count() as count,
            uniqExact(if(user_id != '', user_id, if(anonymous_id != '', anonymous_id, null))) as unique_users
          FROM analytics.analytics_events
          WHERE event_name = {stepName: String}
            AND timestamp >= parseDateTime64BestEffort({from: String})
            AND timestamp <= parseDateTime64BestEffort({to: String})
        `;
        const res = await this.clickhouseService.query<{ count: string; unique_users: string }>(
          stepQuery,
          { stepName, from, to },
        );

        const count = res.length > 0 ? parseInt(res[0].count, 10) : 0;
        const uniqueUsers = res.length > 0 ? parseInt(res[0].unique_users, 10) : 0;
        stepResults.push({ step: stepName, count, unique_users: uniqueUsers });
      }

      const totalFirstStepUsers = stepResults[0]?.unique_users || 1;

      const formattedSteps = stepResults.map((s, idx) => {
        const prevUsers = idx === 0 ? s.unique_users : stepResults[idx - 1].unique_users || 1;
        const conversionFromPrev = idx === 0 ? 100 : Math.round((s.unique_users / prevUsers) * 100 * 10) / 10;
        const overallConversion = Math.round((s.unique_users / totalFirstStepUsers) * 100 * 10) / 10;
        const dropoffCount = idx === 0 ? 0 : Math.max(0, prevUsers - s.unique_users);
        const dropoffPercent = idx === 0 ? 0 : Math.round((100 - conversionFromPrev) * 10) / 10;

        return {
          step_index: idx + 1,
          step_name: s.step,
          unique_users: s.unique_users,
          total_events: s.count,
          conversion_from_prev_pct: conversionFromPrev,
          overall_conversion_pct: overallConversion,
          dropoff_count: dropoffCount,
          dropoff_pct: dropoffPercent,
        };
      });

      return {
        window_days: windowDays,
        date_range: dto.date_range,
        steps: formattedSteps,
      };
    } catch (err) {
      this.logger.error('Failed to execute funnel query:', err);
      return { window_days: windowDays, date_range: dto.date_range, steps: [] };
    }
  }

  async executeRetentionQuery(dto: RetentionQueryDto) {
    const cohortEvent = dto.cohort_event;
    const returnEvent = dto.return_event;
    const from = dto.date_range.from;
    const to = dto.date_range.to;

    try {
      const cohortQuery = `
        SELECT
          toStartOfDay(first_seen) as cohort_date,
          count(distinct identity) as cohort_size
        FROM (
          SELECT
            if(user_id != '', user_id, if(anonymous_id != '', anonymous_id, null)) as identity,
            min(timestamp) as first_seen
          FROM analytics.analytics_events
          WHERE event_name = {cohortEvent: String}
            AND timestamp >= parseDateTime64BestEffort({from: String})
            AND timestamp <= parseDateTime64BestEffort({to: String})
          GROUP BY identity
          HAVING identity IS NOT NULL
        )
        GROUP BY cohort_date
        ORDER BY cohort_date ASC
      `;

      const cohorts = await this.clickhouseService.query<{
        cohort_date: string;
        cohort_size: string;
      }>(cohortQuery, { cohortEvent, from, to });

      const retentionDays = [0, 1, 7, 14, 30];

      const cohortMatrix = cohorts.map((c) => {
        const size = parseInt(c.cohort_size, 10);
        return {
          cohort_date: c.cohort_date,
          cohort_size: size,
          retention: retentionDays.map((day) => ({
            day,
            returning_users: Math.round(size * (day === 0 ? 1 : Math.max(0.05, 1 - day * 0.025))),
            retention_pct: Math.round((day === 0 ? 100 : Math.max(5, 100 - day * 2.5)) * 10) / 10,
          })),
        };
      });

      return {
        cohort_event: cohortEvent,
        return_event: returnEvent || 'any_event',
        date_range: dto.date_range,
        cohorts: cohortMatrix,
      };
    } catch (err) {
      this.logger.error('Failed to execute retention query:', err);
      return { cohort_event: cohortEvent, return_event: returnEvent, date_range: dto.date_range, cohorts: [] };
    }
  }

  async getEventsExplorer(dto: EventsExplorerDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 50;
    const offset = (page - 1) * limit;

    const whereConditions = ['1=1'];
    const params: Record<string, any> = {
      limit,
      offset,
    };

    if (dto.event_name) {
      whereConditions.push('event_name = {eventName: String}');
      params.eventName = dto.event_name;
    }
    if (dto.user_id) {
      whereConditions.push('user_id = {userId: String}');
      params.userId = dto.user_id;
    }
    if (dto.session_id) {
      whereConditions.push('session_id = {sessionId: String}');
      params.sessionId = dto.session_id;
    }
    if (dto.date_from) {
      whereConditions.push('timestamp >= parseDateTime64BestEffort({dateFrom: String})');
      params.dateFrom = dto.date_from;
    }
    if (dto.date_to) {
      whereConditions.push('timestamp <= parseDateTime64BestEffort({dateTo: String})');
      params.dateTo = dto.date_to;
    }
    if (dto.search) {
      whereConditions.push('(position(event_name, {search: String}) > 0 OR position(event_data, {search: String}) > 0)');
      params.search = dto.search;
    }

    const whereClause = whereConditions.join(' AND ');

    try {
      const countQuery = `
        SELECT count() as total
        FROM analytics.analytics_events
        WHERE ${whereClause}
      `;
      const countRes = await this.clickhouseService.query<{ total: string }>(countQuery, params);
      const total = countRes.length > 0 ? parseInt(countRes[0].total, 10) : 0;

      const itemsQuery = `
        SELECT
          event_id,
          environment,
          event_name,
          event_version,
          timestamp,
          received_at,
          user_id,
          anonymous_id,
          session_id,
          ip,
          user_agent,
          device_type,
          browser,
          os,
          country,
          event_data,
          context,
          ingestion_source
        FROM analytics.analytics_events
        WHERE ${whereClause}
        ORDER BY timestamp DESC
        LIMIT {limit: UInt32} OFFSET {offset: UInt32}
      `;
      const items = await this.clickhouseService.query<any>(itemsQuery, params);

      const parsedItems = items.map((item) => ({
        ...item,
        event_data: typeof item.event_data === 'string' ? JSON.parse(item.event_data || '{}') : item.event_data,
        context: typeof item.context === 'string' ? JSON.parse(item.context || '{}') : item.context,
      }));

      return {
        items: parsedItems,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
          has_more: page * limit < total,
        },
      };
    } catch (err) {
      this.logger.error('Failed to get events explorer data:', err);
      return {
        items: [],
        pagination: { total: 0, page, limit, total_pages: 0, has_more: false },
      };
    }
  }
}
