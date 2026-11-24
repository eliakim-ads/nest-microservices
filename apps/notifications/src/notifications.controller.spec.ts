import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [NotificationsService],
    }).compile();

    notificationsController = app.get<NotificationsController>(NotificationsController);
    notificationsService = app.get<NotificationsService>(NotificationsService);
  });

  describe('handleOrderCreated', () => {
    it('should send the notification and acknowledge the message', async () => {
      const data = {
        orderId: 1,
        userId: 2,
        total: '150.00',
      };
      const message = {};
      const channel = {
        ack: jest.fn(),
        nack: jest.fn(),
      };
      const context = {
        getChannelRef: () => channel,
        getMessage: () => message,
      } as unknown as RmqContext;

      jest
        .spyOn(notificationsService, 'sendOrderNotification')
        .mockResolvedValue({ success: true });

      await notificationsController.handleOrderCreated(data, context);

      expect(notificationsService.sendOrderNotification).toHaveBeenCalledWith(data);
      expect(channel.ack).toHaveBeenCalledWith(message);
    });
  });
});
//Removido getHello(), que não existe mais no controller. Criado o teste para handleOrderCreated.