import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: parseInt(process.env.AI_AGENT_TCP_PORT ?? '3002', 10),
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen();

  console.log(
    `AI Agent service TCP: port ${process.env.AI_AGENT_TCP_PORT ?? 3002}`,
  );
}

bootstrap();
