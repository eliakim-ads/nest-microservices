// O orders.service.ts é responsável por lidar com a lógica de negócios relacionada a pedidos.
// Ele utiliza o PrismaService para interagir com o banco de dados e gerenciar os pedidos.
// Além disso, ele se comunica com outros microserviços, como o serviço de usuários e o serviço de notificações,
// utilizando o ClientProxy do NestJS para enviar e receber mensagens via RabbitMQ.
// O serviço de pedidos é responsável por criar novos pedidos, consultar pedidos existentes e publicar eventos de criação de pedidos
// para que outros microserviços possam reagir a essas mudanças.

import { Inject, Injectable } from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { PrismaService } from './prisma.service';
import { randomUUID } from 'node:crypto';
import { CreateOrderDto, OrderCreatedEvent } from '@app/contracts';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}
// O método create é responsável por criar um novo pedido. Ele realiza as seguintes etapas:
// 1. Consulta o microserviço de usuários para verificar se o usuário existe.
// 2. Se o usuário não for encontrado, lança um erro.
// 3. Salva o pedido e o evento de criação do pedido na tabela outbox de forma atômica, utilizando uma transação do Prisma.
// 4. Retorna o pedido criado.
  async create(data: CreateOrderDto) {
    // 1. Consultar usuário
    const user = await firstValueFrom(
      this.usersClient
        .send('users.findOne', data.userId)
        .pipe(timeout(3000)),
    );
    // Se o usuário não for encontrado, lançar um erro
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // 2. Salvar pedido e evento na outbox atomicamente
    const result = await this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.create({
          data: {
            userId: data.userId,
            description: data.description,
            total: data.total,
          },
        });

        const event: OrderCreatedEvent = {
          eventId: randomUUID(),
          orderId: order.id,
          userId: order.userId,
          total: order.total.toString(),
          occurredAt: new Date().toISOString(),
        };

        await tx.outboxEvent.create({
          data: {
            id: event.eventId,
            eventType: 'order.created',
            payload: { ...event },
          },
        });

        return order;
      },
    );

    return result;
  }

  findAll() {
    return this.prisma.order.findMany();
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }
}
