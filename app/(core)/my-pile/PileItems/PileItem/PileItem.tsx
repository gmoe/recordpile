import { useCallback, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ChevronsDown, ChevronDown, ChevronsUp, ChevronUp } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { PileItemStatus } from '@/app/db/schemas/pileItems';
import { type ClientPileItem, reorderPileItem } from '../../actions';
import missingArt from './missingArt.svg';
import EditItem from './EditItem';
import styles from './PileItem.module.scss';

type PileItemProps = {
  item: ClientPileItem;
  index: number;
  nextOrderIndex: number | null;
  previousOrderIndex: number | null;
  firstOrderIndex: number | null;
  lastOrderIndex: number | null;
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
  nextOrderIndex,
  previousOrderIndex,
  firstOrderIndex,
  lastOrderIndex,
}: PileItemProps) {
  const [isEditDialogOpen, isSetEditDialogOpen] = useState<boolean>(false);
  const hideReorder = nextOrderIndex === null && previousOrderIndex === null;

  const toggleEditModal = useCallback(() => {
    isSetEditDialogOpen((open) => !open);
  }, []);

  return (
    <li className={itemStyles({ hideReorder })}>
      {!hideReorder && (
        <div className={styles.index}>
          <button
            disabled={previousOrderIndex === null}
            onClick={() => reorderPileItem(item.id, firstOrderIndex as number)}
          >
            <ChevronsUp size={16} />
          </button>
          <div className={styles.innerIndex}>
            <button
              disabled={previousOrderIndex === null}
              onClick={() => reorderPileItem(item.id, previousOrderIndex as number)}
            >
              <ChevronUp size={16} />
            </button>
            <span>{index + 1}</span>
            <button
              disabled={nextOrderIndex === null}
              onClick={() => reorderPileItem(item.id, nextOrderIndex as number)}
            >
              <ChevronDown size={16} />
            </button>
          </div>
          <button
            disabled={nextOrderIndex === null}
            onClick={() => reorderPileItem(item.id, lastOrderIndex as number)}
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
      <EditItem item={item} open={isEditDialogOpen} onOpenChange={toggleEditModal} />
    </li>
  );
}
