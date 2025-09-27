'use node';
import path from 'node:path';
import process from 'node:process';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { PileItem } from './entities/PileItem';
import { PileItemSubscriber } from './subscribers/PileItemSubscriber';
import { User } from './entities/User';
import { Verification } from './entities/Verification';
import { Session } from './entities/Session';
import { Account } from './entities/Account';

const isProduction = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'postgres',
  database: 'recordpile',
  entities: [PileItem, User, Verification, Session, Account],
  subscribers: [PileItemSubscriber],
  migrations: ['app/db/migrations/**/*.ts'],
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
