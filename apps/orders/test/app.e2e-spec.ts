import type { INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import type { AddressInfo, Server } from 'node:net';
import { firstValueFrom, of, timeout } from 'rxjs';
import { OrdersModule } from '../src/orders.module';
import { PrismaService } from '../src/prisma.service';

describe('OrdersController (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        order: {
          create: jest.fn().mockResolvedValue({ id: 1, userId: 1 }),
          findMany: jest.fn().mockResolvedValue([{ id: 1, userId: 1 }]),
          findUnique: jest.fn().mockResolvedValue({ id: 1, userId: 1 }),
        },
      })
      .overrideProvider('USERS_SERVICE')
      .useValue({ send: jest.fn(() => of({ id: 1 })) })
      .compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: 0 },
    });
    await app.listen();
    const { port } = app.unwrap<Server>().address() as AddressInfo;
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port },
    });
  });

  it('atende à listagem de pedidos via TCP', async () => {
    await expect(
      firstValueFrom(client.send('orders.findAll', {}).pipe(timeout(3000))),
    ).resolves.toEqual([{ id: 1, userId: 1 }]);
  });

  afterEach(async () => {
    await client?.close();
    await app?.close();
  });
});
