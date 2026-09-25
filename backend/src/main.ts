import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { SuccessResponseTransformer } from './core/interceptor/success-response-interceptor';
import { LoggingInterceptor } from './core/interceptor/logging.interceptor';
import { FailureResponseTransformer } from './core/exception-filters/failure-exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const reflector = app.get(Reflector);
  const config = app.get(ConfigService);

  const corsOrigins = config.get<string>('CORS_ORIGINS') || 'http://localhost:5173';
  const allowedOrigins = corsOrigins.split(',').map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Idempotency-Key, X-Request-ID',
  });

  app.use(cookieParser());
  app.use(helmet());

  app.useGlobalFilters(new FailureResponseTransformer());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(reflector),
    new SuccessResponseTransformer(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [config.get<string>('SWAGGER_USER') || 'admin']:
          config.get<string>('SWAGGER_PASSWORD') || 'analytics@2026',
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Product Analytics API Platform')
    .setDescription('Self-hosted, high-performance product analytics backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const PORT = config.get<number>('PORT') || 3000;

  await app.listen(PORT);
  console.log(`Analytics Backend Service running on port ${PORT}`);
}
bootstrap();
