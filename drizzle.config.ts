import { defineConfig } from 'drizzle-kit';

const isProduction = process.env.NODE_ENV !== 'development';

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/new-db/schemas',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: isProduction
      ? { ca: process.env.DATABASE_CA_CERT! }
      : false,
  },
})
