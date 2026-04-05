'use client';
import { useSearchParams } from 'next/navigation';

import { PileItemStatus } from '@/app/db/schemas/pileItems';
import { ClientPileItem } from '../actions';
import { type ReorderDirection } from '../PileItemsContainer';
import PileItem from './PileItem';
import styles from './PileItems.module.scss';

interface PileItemsProps {
  pileItems: ClientPileItem[];
  onReorder: (itemId: string, direction: ReorderDirection) => void;
  onSyncComplete: () => void;
}

export default function PileItems({ pileItems, onReorder, onSyncComplete }: PileItemsProps) {
  const searchParams = useSearchParams();
  const filters = JSON.parse(searchParams.get('filters') ?? '{}');

  const isShowingQueuedItems = filters.status?.includes(PileItemStatus.QUEUED) ?? false;

  if (!pileItems.length) {
    return (
      <div className={styles.emptyCta}>
        <p>
          There are no pile items in your queue, you can
          add more by clicking the button in the toolbar.
        </p>
      </div>
    );
  }

  return (
    <ol className={styles.pile}>
      {pileItems.map((item, index) => (
        <PileItem
          key={item.id}
          item={item}
          index={index}
          canReorder={isShowingQueuedItems}
          isFirst={index === 0}
          isLast={index === pileItems.length - 1}
          onReorder={onReorder}
          onSyncComplete={onSyncComplete}
        />
      ))}
    </ol>
  );
}
