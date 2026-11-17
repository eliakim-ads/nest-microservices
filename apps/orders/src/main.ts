import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { OrdersModule } from './orders.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(OrdersModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.ORDERS_HOST ?? '127.0.0.1',
      port: Number(process.env.ORDERS_PORT ?? 3002),
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();
  await app.listen();
}
void bootstrap();
