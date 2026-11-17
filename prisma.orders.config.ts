
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/orders/schema.prisma',
  migrations: {
    path: 'prisma/orders/migrations',
  },
  datasource: {
    url: process.env.ORDERS_DATABASE_URL,
  },
});
