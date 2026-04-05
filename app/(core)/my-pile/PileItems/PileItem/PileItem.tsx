import { useCallback, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ChevronsDown, ChevronDown, ChevronsUp, ChevronUp } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { PileItemStatus } from '@/app/db/schemas/pileItems';
import { type ClientPileItem } from '../../actions';
import { type ReorderDirection } from '../../PileItemsContainer';
import missingArt from './missingArt.svg';
import EditItem from './EditItem';
import styles from './PileItem.module.scss';

type PileItemProps = {
  item: ClientPileItem;
  index: number;
  canReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  onReorder: (itemId: string, direction: ReorderDirection) => void;
  onSyncComplete: () => void;
};

const itemStyles = cva(styles.item, {
  variants: {
    hideReorder: {
      true: styles.hideReorder,
    },
  },
});

export default function PileItem({
  item,
  index,
  canReorder,
  isFirst,
  isLast,
  onReorder,
  onSyncComplete,
}: PileItemProps) {
  const [isEditDialogOpen, isSetEditDialogOpen] = useState<boolean>(false);

  const toggleEditModal = useCallback(() => {
    isSetEditDialogOpen((open) => !open);
  }, []);

  return (
    <li className={itemStyles({ hideReorder: !canReorder })}>
      {canReorder && (
        <div className={styles.index}>
          <button
            disabled={isFirst}
            onClick={() => onReorder(item.id, 'to-top')}
          >
            <ChevronsUp size={16} />
          </button>
          <div className={styles.innerIndex}>
            <button
              disabled={isFirst}
              onClick={() => onReorder(item.id, 'up-one')}
            >
              <ChevronUp size={16} />
            </button>
            <span>{index + 1}</span>
            <button
              disabled={isLast}
              onClick={() => onReorder(item.id, 'down-one')}
            >
              <ChevronDown size={16} />
            </button>
          </div>
          <button
            disabled={isLast}
            onClick={() => onReorder(item.id, 'to-bottom')}
          >
            <ChevronsDown size={16} />
          </button>
        </div>
      )}
      <Image
        src={item.coverImageUrl}
        alt={`Album art for ${item.albumName}`}
        loading="lazy"
        width={128}
        height={128}
        onClick={toggleEditModal}
        onError={(event) => {
          (event.target as HTMLImageElement).src = missingArt.src;
        }}
      />
      <div
        className={styles.albumInfo}
        onClick={toggleEditModal}
      >
        <span className={styles.album}>{item.albumName}</span>
        <span className={styles.artist}>{item.artistName}</span>
        {item.status === PileItemStatus.QUEUED && (
          <span className={styles.date}>Added: {format(item.addedAt ?? new Date(), 'PP')}</span>
        )}
        {item.status === PileItemStatus.FINISHED && item.finishedAt !== null && (
          <span className={styles.date}>Listened: {format(item.finishedAt, 'PP')}</span>
        )}
        {item.status === PileItemStatus.DID_NOT_FINISH && item.didNotFinishAt !== null && (
          <span className={styles.date}>DNF: {format(item.didNotFinishAt, 'PP')}</span>
        )}
      </div>
      <EditItem
        item={item}
        open={isEditDialogOpen}
        onOpenChange={toggleEditModal}
        onSyncComplete={onSyncComplete}
      />
    </li>
  );
}
