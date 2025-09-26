'use node';
import dataSource from './dataSource';
import { PileItem } from './entities/PileItem';

export * from './entities/PileItem';
export * from './entities/PileItemTypes';

export const dbSource = async () => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  return {
    dataSource,
    pileItemRepo: dataSource.getRepository(PileItem),
  }
}
