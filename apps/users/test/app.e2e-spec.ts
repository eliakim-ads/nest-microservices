import { Test, TestingModule } from '@nestjs/testing';
import type { INestMicroservice } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import type { AddressInfo, Server } from 'node:net';
import { firstValueFrom, timeout } from 'rxjs';
import { PrismaService } from '../src/prisma.service';
import { UsersModule } from './../src/users.module';

describe('UsersController (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Ana' }]),
          findUnique: jest.fn().mockResolvedValue(null),
        },
      })
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

  it('atende às consultas via TCP', async () => {
    await expect(
      firstValueFrom(client.send('users.findAll', {}).pipe(timeout(3000))),
    ).resolves.toEqual([{ id: 1, name: 'Ana' }]);
    await expect(
      firstValueFrom(client.send('users.findOne', 999).pipe(timeout(3000))),
    ).rejects.toMatchObject({ message: 'Usuário não encontrado.' });
  });

  afterEach(async () => {
    await client?.close();
    await app?.close();
  });
});
