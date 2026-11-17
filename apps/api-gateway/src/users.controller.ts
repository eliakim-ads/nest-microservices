import {
  BadRequestException,
  Controller,
  GatewayTimeoutException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

interface User {
  id: number;
  name: string;
}

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Get()
  findAll() {
    return this.request<User[]>('users.findAll', {});
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    if (id < 1 || id > 2_147_483_647) {
      throw new BadRequestException(
        'Informe um ID inteiro entre 1 e 2147483647.',
      );
    }

    const user = await this.request<User | null>('users.findOne', id);
    if (user === null) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  // Limita a espera pela resposta TCP e traduz falhas de conexão para HTTP.
  private async request<T>(
    pattern: string,
    payload: object | number,
  ): Promise<T> {
    try {
      return await firstValueFrom(
        this.usersClient.send<T>(pattern, payload).pipe(timeout(5000)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'O serviço de usuários demorou para responder.',
        );
      }
      if (
        error instanceof Error &&
        'code' in error &&
        [
          'ECONNREFUSED',
          'ECONNRESET',
          'EHOSTUNREACH',
          'ENETUNREACH',
          'ENOTFOUND',
        ].includes(String(error.code))
      ) {
        throw new ServiceUnavailableException(
          'Serviço de usuários indisponível.',
        );
      }
      throw error;
    }
  }
}
