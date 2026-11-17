import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? process.env.port ?? 3000));
}
void bootstrap();
