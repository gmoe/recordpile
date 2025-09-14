'use client';
import { useSearchParams } from 'next/navigation';

import { PileItemStatus } from '@/app/models/PileItemTypes';
import { ClientPileItem } from '../actions';
import PileItem from './PileItem';
import styles from './PileItems.module.scss';

interface PileItemsProps {
  pileItems: ClientPileItem[];
}

export default function PileItems({ pileItems }: PileItemsProps) {
  const searchParams = useSearchParams();
  const filters = JSON.parse(searchParams.get('filters') ?? '');

  const isShowingQueuedItems = filters.status?.includes(PileItemStatus.QUEUED) ?? false;

  return (
    <ol className={styles.pile}>
      {pileItems.map((item, index) => (
        <PileItem
          key={item.id}
          item={item}
          index={index}
          previousOrderIndex={isShowingQueuedItems
            ? pileItems[index - 1]?.orderIndex ?? null
            : null
          }
          nextOrderIndex={isShowingQueuedItems
            ? pileItems[index + 1]?.orderIndex ?? null
            : null
          }
        />
      ))}
    </ol>
  );
}
