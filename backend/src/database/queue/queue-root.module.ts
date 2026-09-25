import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const url = new URL(redisUrl);

        return {
          connection: {
            host: url.hostname || 'localhost',
            port: parseInt(url.port || '6379', 10),
            password: url.password ? decodeURIComponent(url.password) : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class QueueRootModule {}
