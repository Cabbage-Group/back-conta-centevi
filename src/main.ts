import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/download', express.static(join(__dirname, '..', 'uploads')));
  app.enableCors();
  await app.listen(process.env.PORT);
}
bootstrap();