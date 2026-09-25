import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickhouseService } from '../../database/clickhouse/clickhouse.service';
import { DeleteUserDataDto } from './dto/delete-user-data.dto';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class DataDeletionService {
  private readonly logger = new Logger(DataDeletionService.name);

  constructor(
    private readonly clickhouseService: ClickhouseService,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async deleteUserData(dto: DeleteUserDataDto, adminUserId: string, reqIp?: string) {
    if (!dto.user_id && !dto.anonymous_id) {
      throw new BadRequestException('At least one of user_id or anonymous_id must be provided');
    }

    const whereConditions: string[] = [];
    const params: Record<string, any> = {};

    if (dto.user_id) {
      whereConditions.push("user_id = {userId: String}");
      params.userId = dto.user_id;
    }
    if (dto.anonymous_id) {
      whereConditions.push("anonymous_id = {anonId: String}");
      params.anonId = dto.anonymous_id;
    }

    const deleteMutation = `
      ALTER TABLE analytics.analytics_events
      DELETE WHERE ${whereConditions.join(' OR ')}
    `;

    try {
      await this.clickhouseService.getClient().command({
        query: deleteMutation,
        query_params: params,
      });

      // Audit log
      const audit = this.auditLogRepository.create({
        userId: adminUserId,
        action: 'DATA_DELETION_PURGE',
        targetType: 'user_events',
        targetId: dto.user_id || dto.anonymous_id || null,
        details: { requested_deletion: dto },
        ipAddress: reqIp || null,
      });
      await this.auditLogRepository.save(audit);

      return {
        status: 'queued',
        message: 'ClickHouse deletion mutation issued successfully. Mutations process asynchronously in background.',
        target: dto,
      };
    } catch (err) {
      this.logger.error('Failed to issue ClickHouse deletion mutation:', err);
      throw err;
    }
  }
}
