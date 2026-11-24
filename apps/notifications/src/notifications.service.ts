// O notifications.service.ts é responsável por lidar com a lógica de envio de 
// notificações relacionadas a pedidos. 
// Ele utiliza o serviço de log do NestJS para registrar informações sobre 
// as notificações enviadas, como o ID do pedido, o ID do usuário e o total do pedido. 
// Atualmente, ele apenas registra essas informações no console, mas há um comentário 
// indicando que futuramente poderá integrar um serviço de envio de e-mails para 
// enviar notificações reais aos usuários.
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger =
    new Logger(NotificationsService.name);

  async sendOrderNotification(data: {
    orderId: number;
    userId: number;
    total: string;
  }) {
    if (data.total === '9999') {
      throw new Error('Falha simulada');
    }

    console.log('Notificação enviada:', data);



    this.logger.log(
      `Notificação do pedido ${data.orderId}`,
    );

    this.logger.log(
      `Usuário: ${data.userId}`,
    );

    this.logger.log(
      `Total: R$ ${data.total}`,
    );

    // Futuramente:
    // await this.emailService.send(...);

    return { success: true };
  }
}