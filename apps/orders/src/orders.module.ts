// O orders.module.ts é responsável por configurar 
// o módulo de pedidos no microserviço de pedidos.
import { Module } from '@nestjs/common';

import { ClientsModule, Transport } from '@nestjs/microservices';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaService } from './prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxPublisher } from './outbox.publisher';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_HOST ?? '127.0.0.1',
          port: Number(process.env.USERS_PORT ?? 3001),
        },
      },
      {
        name: 'NOTIFICATIONS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'notifications_queue',
          queueOptions: {
            durable: true,
          },
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrismaService,
    OutboxPublisher,
  ],
})
export class OrdersModule {}

//Erro a causa era o OrdersModule: o registro dos clientes estava substituído por um comentário, então o Nest não encontrava o provider USERS_SERVICE.

//Restaurei o registro de USERS_SERVICE e incluí NOTIFICATIONS_CLIENT, usado pelo publisher da outbox. A alteração está em orders.module.ts.

//Build e teste e2e passaram. Ao iniciar, confirme também que RABBITMQ_URL está definido no .env e que o serviço de usuários está disponível; são dependências necessárias após a resolução do provider.
