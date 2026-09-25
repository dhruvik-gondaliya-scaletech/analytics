import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllEntities } from '.';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        let connectionOptions: any = {};

        connectionOptions = {
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 5432,
          username: configService.get<string>('DB_USERNAME') || 'postgres',
          password: configService.get<string>('DB_PASSWORD') || 'postgres',
          database: configService.get<string>('DB_NAME') || 'analytics',
        };

        const isDev = configService.get<string>('NODE_ENV') !== 'production';

        return {
          type: 'postgres',
          ...connectionOptions,
          entities: AllEntities,
          synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE') ?? isDev,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmConnectionModule { }
