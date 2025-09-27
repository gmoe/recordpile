'use node';
import dataSource from './dataSource';
import { PileItem } from './entities/PileItem';
import { User } from './entities/User';
import { Verification } from './entities/Verification';
import { Session } from './entities/Session';
import { Account } from './entities/Account';

export * from './entities/PileItem';
export * from './entities/PileItemTypes';

export const dbSource = async () => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  return {
    dataSource,
    pileItemRepo: dataSource.getRepository(PileItem),
    userRepo: dataSource.getRepository(User),
    verificationRepo: dataSource.getRepository(Verification),
    sessionRepo: dataSource.getRepository(Session),
    accountRepo: dataSource.getRepository(Account),
  }
}
