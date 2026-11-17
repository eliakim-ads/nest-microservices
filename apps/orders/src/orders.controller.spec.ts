import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let ordersController: OrdersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    ordersController = app.get<OrdersController>(OrdersController);
  });

  it('encaminha a listagem para o serviço', async () => {
    await expect(ordersController.findAll()).resolves.toEqual([]);
  });
});
