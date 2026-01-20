import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './swagger/swagger.setup';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.set('trust proxy', true);

  //add new for upload file
  app.use('/uploads-file', express.static(join(process.cwd(), 'uploads-file')));

  // Global success response formatting
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global error response formatting
  app.useGlobalFilters(new GlobalExceptionFilter());

  //here add global pipe line for validation
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //   }),
  // );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Converts types (like string to number)
      },
    }),
  );

  //here add global prefix for api
  app.setGlobalPrefix('/api/v1');
  app.use(cookieParser());

  const config = app.get(ConfigService);
  const port = config.get('port') || 3000;
  const node_env = config.get('node_env') || 'development';

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Backend API Documentation')
    .setDescription(
      'Comprehensive API documentation for the application services',
    )
    .setVersion('1.0')
    .addCookieAuth('refreshToken')
    .addTag('API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  console.log(`🚀 Application is running successfully! port number ${port}`);
}
bootstrap().catch((err) => {
  console.error('❌ Error during bootstrap:', err);
  process.exit(1);
});
