'use node';
import path from 'node:path';
import process from 'node:process';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';

// typeorm cli doesn't run in an ESM context...
const wd = typeof __dirname === 'undefined' ? process.cwd() : __dirname;

const AppDataSource = new DataSource({
  type: 'postgres',
  database: 'recordpile',
  entities: [path.join(wd, 'app/db/entities/**/*.ts')],
  subscribers: [path.join(wd, 'app/db/subscribers/**/*.ts')],
  migrations: [path.join(wd, 'app/db/migrations/**/*.ts')],
  synchronize: !isProduction,
  logging: false,
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'root',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default AppDataSource;
