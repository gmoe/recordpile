'use node';
import dataSource from './dataSource';
import { PileItem } from './PileItem';

export {
  PileItem,
};

export const dbSource = async () => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  return {
    pileItemRepo: dataSource.getRepository(PileItem),
  }
}
