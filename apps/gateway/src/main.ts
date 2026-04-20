import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // required for Stripe webhook signature verification
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'error', 'warn', 'debug'],
  });

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new RpcExceptionFilter());

  const isProduction = process.env.NODE_ENV === 'production';
  const envOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .filter(Boolean);

  const allowedOrigins = [
    'https://codekang.com',
    'https://www.codekang.com',
    ...envOrigins,
  ];

  if (!isProduction) {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://localhost:3010',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3010',
      'http://127.0.0.1:5173',
    );
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => origin === allowed);
      const isLocal =
        !isProduction &&
        /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/.test(origin);

      if (isAllowed || isLocal) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-ID'],
  });

  // Swagger docs (disable in production if needed)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CodeKang Platform API')
      .setDescription(
        'Production-grade API Gateway — GitHub auth, repo management, AI issue fixing, plan management',
      )
      .setVersion('2.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .addTag('auth', 'Authentication & token management')
      .addTag('repos', 'Repository management & GitHub integration')
      .addTag('agent', 'AI agent conversations & issue fixing')
      .addTag('plans', 'Plan & credit management')
      .addTag('billing', 'Stripe billing — checkout, portal, invoices, webhook')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = process.env.GATEWAY_PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Gateway:     http://localhost:${port}/api/v1`);
  console.log(`Swagger:     http://localhost:${port}/api/docs`);
}

bootstrap();
