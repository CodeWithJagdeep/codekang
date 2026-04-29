import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('--- [Auth] Environment Variables ---');
  console.log(process.env);
  console.log('------------------------------------');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: parseInt(process.env.AUTH_TCP_PORT ?? '3001', 10),
      },
    },
  );

  await app.listen();
  console.log(`Auth service TCP: port ${process.env.AUTH_TCP_PORT ?? 3001}`);
}

bootstrap();
