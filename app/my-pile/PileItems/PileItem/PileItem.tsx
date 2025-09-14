'use client';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { PileItemStatus, PileItemStatusLabels } from '@/app/models/PileItemTypes';
import Select from '@/app/components/Select';
import {
  ClientPileItem,
  updatePileItem,
  deletePileItem,
  reorderPileItem,
} from '../../actions';
import missingArt from './missingArt.svg';
import styles from './PileItem.module.scss';

type PileItemProps = {
  item: ClientPileItem;
  index: number;
  nextOrderIndex: number | null;
  previousOrderIndex: number | null;
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
}: PileItemProps) {
  const hideReorder = nextOrderIndex === null && previousOrderIndex === null;

  return (
    <li className={itemStyles({ hideReorder })}>
      {!hideReorder && (
        <div className={styles.index}>
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
      )}
      <img
        src={item.coverImageUrl}
        alt={`Album art for ${item.albumName}`}
        loading="lazy"
        onError={(event) => {
          (event.target as HTMLImageElement).src = missingArt.src;
        }}
      />
      <div className={styles.albumInfo}>
        <span className={styles.artist}>{item.artistName}</span>
        <span className={styles.album}>{item.albumName}</span>
      </div>
      <div className={styles.controls}>
        {item.status === PileItemStatus.QUEUED && (
          <span>Added: {format(item.addedAt, 'PP')}</span>
        )}
        {item.status === PileItemStatus.LISTENED && (
          <span>Listened: {format(item.listenedAt, 'PP')}</span>
        )}
        {item.status === PileItemStatus.DID_NOT_FINISH && (
          <span>DNF: {format(item.didNotFinishAt, 'PP')}</span>
        )}
        <Select
          onChange={(value) => updatePileItem(item.id, { status: (value as PileItemStatus) })}
          value={item.status}
        >
          <option value={PileItemStatus.QUEUED}>Queued</option>
          <option value={PileItemStatus.LISTENED}>Listened</option>
          <option value={PileItemStatus.DID_NOT_FINISH}>Did Not Finish</option>
        </Select>
        <button onClick={() => deletePileItem(item.id)}>
          Remove
        </button>
      </div>
    </li>
  );
}
