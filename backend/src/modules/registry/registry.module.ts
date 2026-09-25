import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { EventDefinition } from '../../database/entities/event-definition.entity';
import { EventPropertyDefinition } from '../../database/entities/event-property-definition.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventDefinition, EventPropertyDefinition]),
    AuthModule,
  ],
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule {}
