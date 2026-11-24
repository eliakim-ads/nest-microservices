// O main.ts é o ponto de entrada do microserviço de notificações. 
// Ele configura e inicializa o microserviço usando o NestJS, especificando o 
// módulo principal (NotificationsModule) e as opções de transporte (RabbitMQ). 
// O microserviço escuta a fila de notificações definida no arquivo .env e 
// processa as mensagens recebidas, delegando a lógica de envio de notificações 
// para o serviço NotificationsService.
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';

import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      NotificationsModule,
      {
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'notifications_queue',
          queueOptions: {
            durable: true,
          },
          noAck: false,
          prefetchCount: 1,
        },
      },
    );

  await app.listen();
}

bootstrap();
