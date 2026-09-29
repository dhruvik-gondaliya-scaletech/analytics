import { Module } from '@nestjs/common';
import { UserprofileController } from './userprofile.controller';
import { UserprofileService } from './userprofile.service';

@Module({
  controllers: [UserprofileController],
  providers: [UserprofileService]
})
export class UserprofileModule {}
