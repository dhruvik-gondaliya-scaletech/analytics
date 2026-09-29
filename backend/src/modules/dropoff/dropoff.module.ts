import { Module } from '@nestjs/common';
import { DropoffController } from './dropoff.controller';
import { DropoffService } from './dropoff.service';

@Module({
  controllers: [DropoffController],
  providers: [DropoffService]
})
export class DropoffModule {}
