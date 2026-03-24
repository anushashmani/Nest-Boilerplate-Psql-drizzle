import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use cookie parser
  app.use(cookieParser());

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Set global prefix
  app.setGlobalPrefix('api', { exclude: ['/'] });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription('The core API documentation for the NestJS Boilerplate project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global pipes
  // whitelist: true strips any properties not declared in the DTO.
  // forbidNonWhitelisted is intentionally omitted: unknown fields are silently
  // stripped rather than rejected, which is both user-friendly and secure
  // (prevents mass-assignment without breaking valid requests that include
  // extra properties such as `role` on the registration endpoint).
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
