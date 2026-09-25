import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IngestionApiKey, KeyStatus } from '../../../database/entities/ingestion-api-key.entity';

@Injectable()
export class IngestionKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(IngestionApiKey)
    private readonly apiKeyRepository: Repository<IngestionApiKey>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Ingestion authorization token missing');
    }

    const defaultToken =
      this.configService.get<string>('INGESTION_WRITE_TOKEN') || 'default-write-token';

    if (token === defaultToken) {
      return true;
    }

    // Check database hashed keys
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const apiKey = await this.apiKeyRepository
      .createQueryBuilder('key')
      .addSelect('key.keyHash')
      .where('key.key_hash = :hash', { hash })
      .andWhere('key.status = :status', { status: KeyStatus.ACTIVE })
      .getOne();

    if (!apiKey) {
      throw new UnauthorizedException('Invalid or revoked ingestion write token');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      apiKey.status = KeyStatus.EXPIRED;
      await this.apiKeyRepository.save(apiKey);
      throw new UnauthorizedException('Ingestion token has expired');
    }

    // Update last used asynchronously
    apiKey.lastUsedAt = new Date();
    this.apiKeyRepository.save(apiKey).catch(() => {});

    return true;
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    const queryKey = request.query?.api_key || request.query?.key;
    if (typeof queryKey === 'string') {
      return queryKey.trim();
    }
    return undefined;
  }
}
