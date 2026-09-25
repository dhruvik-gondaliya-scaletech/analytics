import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickhouseService } from '../../database/clickhouse/clickhouse.service';
import { EventsExplorerDto } from '../analytics/dto/events-explorer.dto';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(
    private readonly clickhouseService: ClickhouseService,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  private sanitizeCsvCell(value: any): string {
    if (value === null || value === undefined) return '""';
    let str = typeof value === 'object' ? JSON.stringify(value) : String(value);

    // Prevent CSV formula injection
    if (/^[=+@-].*/.test(str)) {
      str = `'${str}`;
    }

    // Escape double quotes
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  async exportEventsCsv(dto: EventsExplorerDto, res: Response, userId: string, reqIp?: string) {
    const limit = Math.min(dto.limit || 50000, 50000);

    const whereConditions = ['1=1'];
    const params: Record<string, any> = { limit };

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

    const sql = `
      SELECT
        event_id,
        environment,
        event_name,
        event_version,
        timestamp,
        user_id,
        anonymous_id,
        session_id,
        ip,
        country,
        event_data
      FROM analytics.analytics_events
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY timestamp DESC
      LIMIT {limit: UInt32}
    `;

    const rows = await this.clickhouseService.query<any>(sql, params);

    // Log audit action
    try {
      const audit = this.auditLogRepository.create({
        userId,
        action: 'CSV_EXPORT_EVENTS',
        targetType: 'analytics_events',
        targetId: null,
        details: { count: rows.length, filter: dto },
        ipAddress: reqIp || null,
      });
      await this.auditLogRepository.save(audit);
    } catch {}

    const headers = [
      'Event ID',
      'Environment',
      'Event Name',
      'Version',
      'Timestamp (UTC)',
      'User ID',
      'Anonymous ID',
      'Session ID',
      'IP',
      'Country',
      'Event Data JSON',
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analytics-events-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    );

    res.write(headers.map((h) => this.sanitizeCsvCell(h)).join(',') + '\n');

    for (const row of rows) {
      const line = [
        row.event_id,
        row.environment,
        row.event_name,
        row.event_version,
        row.timestamp,
        row.user_id,
        row.anonymous_id,
        row.session_id,
        row.ip,
        row.country,
        row.event_data,
      ]
        .map((val) => this.sanitizeCsvCell(val))
        .join(',');

      res.write(line + '\n');
    }

    res.end();
  }
}
