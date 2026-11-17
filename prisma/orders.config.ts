import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'orders/schema.prisma',
  migrations: { path: 'orders/migrations' },
  datasource: {
    url:
      process.env.ORDERS_DATABASE_URL ??
      'postgresql://postgres:postgres@127.0.0.1:5432/orders_db',
  },
});
