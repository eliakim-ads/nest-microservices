import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/users/schema.prisma',
  migrations: { path: 'prisma/users/migrations' },
  datasource: { url: process.env.USERS_DATABASE_URL },
});
