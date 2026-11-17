import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Ana' }]),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
  });

  it('retorna os usuários consultados pelo serviço', async () => {
    await expect(usersController.findAll()).resolves.toEqual([
      { id: 1, name: 'Ana' },
    ]);
  });

  it('retorna null quando o usuário não existe', async () => {
    await expect(usersController.findOne(999)).resolves.toBeNull();
  });
});
