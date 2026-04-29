import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('--- [Repos] Environment Variables ---');
  console.log(process.env);
  console.log('-------------------------------------');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: parseInt(process.env.REPOS_TCP_PORT ?? '3003', 10),
      },
    },
  );

  await app.listen();
  console.log(`Repos service TCP: port ${process.env.REPOS_TCP_PORT ?? 3003}`);
}

bootstrap();
