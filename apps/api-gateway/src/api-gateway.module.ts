import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UsersController } from './users.controller';
import { OrdersController } from './orders.controller';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_HOST ?? '127.0.0.1',
          port: Number(process.env.USERS_PORT ?? 3001),
        },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ORDERS_HOST ?? '127.0.0.1',
          port: Number(process.env.ORDERS_PORT ?? 3002),
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController, UsersController, OrdersController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
