import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { of } from 'rxjs';
import { ApiGatewayModule } from './../src/api-gateway.module';

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    })
      .overrideProvider('USERS_SERVICE')
      .useValue({
        send: jest.fn((pattern: string, id: number) => {
          const ana = { id: 1, name: 'Ana' };
          return of(
            pattern === 'users.findAll' ? [ana] : id === 1 ? ana : null,
          );
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('lista os usuários e consulta por ID', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .expect(200, [{ id: 1, name: 'Ana' }]);
    await request(app.getHttpServer())
      .get('/users/1')
      .expect(200, { id: 1, name: 'Ana' });
  });

  it('retorna 400 para ID inválido e null para ID inexistente', async () => {
    await request(app.getHttpServer()).get('/users/abc').expect(400);
    await request(app.getHttpServer()).get('/users/999').expect(200);
  });

  afterEach(async () => {
    await app.close();
  });
});
