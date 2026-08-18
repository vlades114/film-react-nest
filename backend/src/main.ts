import './crypto-polyfill';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { createLogger } from './logger/logger.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);

  app.useLogger(createLogger(configService.get<string>('LOGGER_TYPE')));

  app.setGlobalPrefix('api/afisha');
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);
}
bootstrap();
