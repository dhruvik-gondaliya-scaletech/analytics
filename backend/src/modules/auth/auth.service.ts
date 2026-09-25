import {
  Injectable,
  UnauthorizedException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { DashboardUser, UserRole, UserStatus } from '../../database/entities/dashboard-user.entity';
import { LoginDto } from './dto/login.dto';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(DashboardUser)
    private readonly userRepository: Repository<DashboardUser>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultUsers();
  }

  async seedDefaultUsers() {
    try {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount === 0) {
        const adminPassword =
          this.configService.get<string>('SEED_ADMIN_PASSWORD') || 'AdminPass@2026';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = this.userRepository.create({
          email: 'admin@analytics.local',
          displayName: 'System Admin',
          passwordHash: hashedPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        });

        await this.userRepository.save(admin);
        this.logger.log(`Seeded default ADMIN user: admin@analytics.local (Pass: ${adminPassword})`);
      }

      const analystCount = await this.userRepository.count({
        where: { role: UserRole.ANALYST },
      });

      if (analystCount === 0) {
        const analystPassword =
          this.configService.get<string>('SEED_ANALYST_PASSWORD') || 'AnalystPass@2026';
        const hashedPassword = await bcrypt.hash(analystPassword, 10);

        const analyst = this.userRepository.create({
          email: 'analyst@analytics.local',
          displayName: 'Product Analyst',
          passwordHash: hashedPassword,
          role: UserRole.ANALYST,
          status: UserStatus.ACTIVE,
        });

        await this.userRepository.save(analyst);
        this.logger.log(`Seeded default ANALYST user: analyst@analytics.local (Pass: ${analystPassword})`);
      }
    } catch (err) {
      this.logger.error('Error seeding default dashboard users:', err);
    }
  }

  async login(loginDto: LoginDto, ipAddress?: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: loginDto.email.toLowerCase() })
      .getOne();

    if (!user || user.status !== UserStatus.ACTIVE) {
      await this.logAudit(null, 'LOGIN_FAILED', 'user', null, { email: loginDto.email }, ipAddress);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.logAudit(user.id, 'LOGIN_FAILED', 'user', user.id, { email: loginDto.email }, ipAddress);
      throw new UnauthorizedException('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };

    const token = await this.jwtService.signAsync(payload);

    await this.logAudit(user.id, 'LOGIN_SUCCESS', 'user', user.id, { email: user.email }, ipAddress);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  private async logAudit(
    userId: string | null,
    action: string,
    targetType: string,
    targetId: string | null,
    details?: Record<string, any>,
    ipAddress?: string,
  ) {
    try {
      const audit = this.auditLogRepository.create({
        userId,
        action,
        targetType,
        targetId,
        details,
        ipAddress: ipAddress || null,
      });
      await this.auditLogRepository.save(audit);
    } catch (e) {
      this.logger.error('Failed to save audit log:', e);
    }
  }
}
