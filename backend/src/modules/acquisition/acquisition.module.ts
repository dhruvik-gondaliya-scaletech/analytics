import { Module } from '@nestjs/common';
import { AcquisitionController } from './acquisition.controller';
import { AcquisitionService } from './acquisition.service';

@Module({
  controllers: [AcquisitionController],
  providers: [AcquisitionService]
})
export class AcquisitionModule {}
