import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { IngestionApiKey, KeyStatus } from '../../database/entities/ingestion-api-key.entity';
import { DashboardUser, UserStatus } from '../../database/entities/dashboard-user.entity';
import { CreateIngestionKeyDto } from './dto/create-key.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(IngestionApiKey)
    private readonly keyRepository: Repository<IngestionApiKey>,
    @InjectRepository(DashboardUser)
    private readonly userRepository: Repository<DashboardUser>,
  ) {}

  // Ingestion Keys
  async listKeys() {
    return this.keyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createKey(dto: CreateIngestionKeyDto) {
    const rawSecret = `ak_live_${crypto.randomBytes(24).toString('hex')}`;
    const prefix = rawSecret.slice(0, 12);
    const keyHash = crypto.createHash('sha256').update(rawSecret).digest('hex');

    const key = this.keyRepository.create({
      name: dto.name,
      keyPrefix: prefix,
      keyHash,
      status: KeyStatus.ACTIVE,
    });

    const saved = await this.keyRepository.save(key);

    return {
      id: saved.id,
      name: saved.name,
      key_prefix: saved.keyPrefix,
      token: rawSecret, // Displayed ONLY ONCE upon creation
      created_at: saved.createdAt,
      message: 'Store this token securely. It will not be shown again.',
    };
  }

  async revokeKey(id: string) {
    const key = await this.keyRepository.findOne({ where: { id } });
    if (!key) {
      throw new NotFoundException(`Ingestion key '${id}' not found`);
    }
    key.status = KeyStatus.REVOKED;
    await this.keyRepository.save(key);
    return { message: 'Ingestion key revoked' };
  }

  // Dashboard Users (ADMIN only)
  async listUsers() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException(`User with email '${dto.email}' already exists`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      displayName: dto.displayName,
      passwordHash: hashedPassword,
      role: dto.role,
      status: UserStatus.ACTIVE,
    });

    const saved = await this.userRepository.save(user);
    const { passwordHash, ...result } = saved;
    return result;
  }

  async updateUser(id: string, dto: Partial<CreateUserDto>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User '${id}' not found`);
    }

    if (dto.displayName !== undefined) user.displayName = dto.displayName;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const saved = await this.userRepository.save(user);
    const { passwordHash, ...result } = saved;
    return result;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User '${id}' not found`);
    }

    await this.userRepository.remove(user);
    return { message: 'Dashboard user deleted' };
  }
}
