'use node';

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PileItem } from './PileItem';

const isProduction = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'postgres',
  database: 'recordpile',
  entities: [PileItem],
  synchronize: !isProduction,
  logging: !isProduction,
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'root',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default AppDataSource;
