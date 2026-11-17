import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateOrderDto } from '@app/contracts';
import { PrismaService } from './prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  async create(data: CreateOrderDto) {
    try {
      await firstValueFrom(
        this.usersClient.send('users.findOne', data.userId).pipe(timeout(3000)),
      );
    } catch {
      throw new BadRequestException('Usuário inválido ou indisponível.');
    }
    return this.prisma.order.create({ data });
  }

  findAll() {
    return this.prisma.order.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id } });
  }
}
