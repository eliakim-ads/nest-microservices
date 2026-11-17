import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UsersModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.USERS_HOST ?? '127.0.0.1',
      port: Number(process.env.USERS_PORT ?? 3001),
    },
  });

  app.enableShutdownHooks();
  await app.listen();
}

void bootstrap();
