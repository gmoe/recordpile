'use node';

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PileItem } from './PileItem';

const isProduction = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'recordpile',
  entities: [PileItem],
  synchronize: !isProduction,
  logging: !isProduction,
});

export default AppDataSource;
