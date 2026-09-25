import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataDeletionController } from './data-deletion.controller';
import { DataDeletionService } from './data-deletion.service';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), AuthModule],
  controllers: [DataDeletionController],
  providers: [DataDeletionService],
  exports: [DataDeletionService],
})
export class DataDeletionModule {}
