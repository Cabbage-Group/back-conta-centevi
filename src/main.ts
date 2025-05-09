import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/download', express.static(join(__dirname, '..', 'uploads')));
  app.enableCors({
    origin: [
      'http://127.0.0.1:8000',
      'https://contabilidad.centevi.digital',
      'https://centevi-laravel.centevi.digital'
    ],
    methods: 'GET, POST, PUT, DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization, x-requested-with', // Encabezados permitidos
    credentials: true
  });
  await app.listen(process.env.PORT);
}
bootstrap();