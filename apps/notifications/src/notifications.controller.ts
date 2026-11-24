// O notifications.controller.ts é responsável por receber eventos de criação de pedidos do microserviço de pedidos.
// Ele utiliza o padrão de eventos do NestJS para escutar eventos do RabbitMQ, especificamente o evento 'order.created'.
// Quando um evento de criação de pedido é recebido, ele delega a lógica de envio de notificações para o serviço NotificationsService.
// O controller também lida com o reconhecimento (ack) e não reconhecimento (nack) das mensagens recebidas, garantindo que as mensagens sejam processadas corretamente.
import { Controller } from '@nestjs/common';

import {  Ctx,  EventPattern,  Payload,  RmqContext,} from '@nestjs/microservices';

import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService:
      NotificationsService,
  ) {}
// correção do  @EventPattern('order.created') inserindo <string> Isso evita o novo overload tipado do Nest 12 que entra em conflito com RmqContext e ...args: unknown[].
  @EventPattern<string>('order.created')
  async handleOrderCreated(
    @Payload() data: {
      orderId: number;
      userId: number;
      total: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.notificationsService
        .sendOrderNotification(data);

      channel.ack(message);
    } catch (error) {
      channel.nack(message, false, false);
      throw error;
    }
  }
}
