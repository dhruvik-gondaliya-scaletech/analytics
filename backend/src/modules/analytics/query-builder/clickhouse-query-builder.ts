import {
  AnalyticsQueryDto,
  AggregationType,
  FilterOperator,
} from '../dto/analytics-query.dto';

export class ClickhouseQueryBuilder {
  private static readonly COLUMN_ALLOWLIST = new Set([
    'event_id',
    'environment',
    'event_name',
    'event_version',
    'timestamp',
    'received_at',
    'user_id',
    'anonymous_id',
    'session_id',
    'ip',
    'user_agent',
    'device_type',
    'browser',
    'os',
    'country',
    'ingestion_source',
  ]);

  static buildTimeSeriesQuery(dto: AnalyticsQueryDto): {
    sql: string;
    params: Record<string, any>;
  } {
    const params: Record<string, any> = {
      from: dto.date_range.from,
      to: dto.date_range.to,
    };

    const intervalFunc = this.getIntervalFunction(dto.interval || 'day');

    let aggExpr = 'count()';
    if (dto.aggregation === AggregationType.UNIQUE_USERS) {
      aggExpr = `uniqExact(if(user_id != '', user_id, if(anonymous_id != '', anonymous_id, null)))`;
    } else if (dto.property_key) {
      const propExpr = this.formatPropertyExpression(dto.property_key);
      switch (dto.aggregation) {
        case AggregationType.SUM:
          aggExpr = `sum(toFloat64OrZero(${propExpr}))`;
          break;
        case AggregationType.AVG:
          aggExpr = `avg(toFloat64OrZero(${propExpr}))`;
          break;
        case AggregationType.MIN:
          aggExpr = `min(toFloat64OrZero(${propExpr}))`;
          break;
        case AggregationType.MAX:
          aggExpr = `max(toFloat64OrZero(${propExpr}))`;
          break;
        default:
          aggExpr = 'count()';
      }
    }

    const whereConditions = ['timestamp >= parseDateTime64BestEffort({from: String})', 'timestamp <= parseDateTime64BestEffort({to: String})'];

    if (dto.event_name) {
      whereConditions.push('event_name = {eventName: String}');
      params.eventName = dto.event_name;
    }

    if (dto.filters && dto.filters.length > 0) {
      dto.filters.forEach((filter, idx) => {
        const paramKey = `filter_${idx}`;
        const condition = this.buildFilterCondition(filter, paramKey, params);
        if (condition) {
          whereConditions.push(condition);
        }
      });
    }

    let selectBreakdown = '';
    let groupByBreakdown = '';

    if (dto.breakdown_by) {
      const breakdownExpr = this.formatPropertyExpression(dto.breakdown_by);
      selectBreakdown = `, ${breakdownExpr} as breakdown`;
      groupByBreakdown = `, breakdown`;
    }

    const sql = `
      SELECT
        ${intervalFunc}(timestamp) as time_bucket,
        ${aggExpr} as value
        ${selectBreakdown}
      FROM analytics.analytics_events
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY time_bucket ${groupByBreakdown}
      ORDER BY time_bucket ASC
    `;

    return { sql, params };
  }

  private static getIntervalFunction(interval: string): string {
    switch (interval) {
      case 'minute':
        return 'toStartOfMinute';
      case 'hour':
        return 'toStartOfHour';
      case 'week':
        return 'toStartOfWeek';
      case 'month':
        return 'toStartOfMonth';
      case 'day':
      default:
        return 'toStartOfDay';
    }
  }

  private static formatPropertyExpression(property: string): string {
    const cleanProp = property.replace(/[^a-zA-Z0-9_.-]/g, '');
    if (this.COLUMN_ALLOWLIST.has(cleanProp)) {
      return cleanProp;
    }
    // Safely extract from event_data JSON
    return `JSONExtractString(event_data, '${cleanProp}')`;
  }

  private static buildFilterCondition(
    filter: any,
    paramKey: string,
    params: Record<string, any>,
  ): string | null {
    const expr = this.formatPropertyExpression(filter.property);
    params[paramKey] = filter.value;

    switch (filter.operator) {
      case FilterOperator.EQUALS:
        return `${expr} = {${paramKey}: String}`;
      case FilterOperator.NOT_EQUALS:
        return `${expr} != {${paramKey}: String}`;
      case FilterOperator.CONTAINS:
        return `position(${expr}, {${paramKey}: String}) > 0`;
      case FilterOperator.STARTS_WITH:
        return `startsWith(${expr}, {${paramKey}: String})`;
      case FilterOperator.ENDS_WITH:
        return `endsWith(${expr}, {${paramKey}: String})`;
      case FilterOperator.GREATER_THAN:
        return `toFloat64OrZero(${expr}) > toFloat64OrZero({${paramKey}: String})`;
      case FilterOperator.GREATER_THAN_OR_EQUAL:
        return `toFloat64OrZero(${expr}) >= toFloat64OrZero({${paramKey}: String})`;
      case FilterOperator.LESS_THAN:
        return `toFloat64OrZero(${expr}) < toFloat64OrZero({${paramKey}: String})`;
      case FilterOperator.LESS_THAN_OR_EQUAL:
        return `toFloat64OrZero(${expr}) <= toFloat64OrZero({${paramKey}: String})`;
      case FilterOperator.EXISTS:
        return `${expr} != ''`;
      case FilterOperator.NOT_EXISTS:
        return `${expr} = ''`;
      default:
        return `${expr} = {${paramKey}: String}`;
    }
  }
}
