import { defineConfig } from 'drizzle-kit';

const isProduction = process.env.NODE_ENV !== 'development';

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/new-db/schemas',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT!),
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    ssl: isProduction
      ? { ca: process.env.DATABASE_CA_CERT! }
      : false,
  },
  schemaFilter: 'public',
  migrations: {
    schema: 'public',
  },
})
