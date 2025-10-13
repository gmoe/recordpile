'use client';
import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { PileItemStatus } from '@/app/db/schemas/pileItems';
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
  const [editingNotes, setEditingNotes] = useState<boolean>(false);
  const [stagedNotes, setStagedNotes] = useState<string>(item.notes ?? '');
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
      <Image
        src={item.coverImageUrl}
        alt={`Album art for ${item.albumName}`}
        loading="lazy"
        width={100}
        height={100}
        onError={(event) => {
          (event.target as HTMLImageElement).src = missingArt.src;
        }}
      />
      {editingNotes ? (
        <div className={styles.albumInfo}>
          <label htmlFor={`notes-${item.id}`}>Notes</label>
          <textarea
            id={`notes-${item.id}`}
            onChange={(event) => setStagedNotes(event.target.value)}
            value={stagedNotes}
          />
          <button
            type="submit"
            onClick={() => updatePileItem(item.id, { notes: stagedNotes })}
          >
            Save
          </button>
        </div>
      ) : (
        <div className={styles.albumInfo}>
          <span className={styles.artist}>{item.artistName}</span>
          <span className={styles.album}>{item.albumName}</span>
        </div>
      )}
      <div className={styles.controls}>
        {item.status === PileItemStatus.QUEUED && (
          <span>Added: {format(item.addedAt ?? new Date(), 'PP')}</span>
        )}
        {item.status === PileItemStatus.FINISHED && item.finishedAt !== null && (
          <span>Listened: {format(item.finishedAt, 'PP')}</span>
        )}
        {item.status === PileItemStatus.DID_NOT_FINISH && item.didNotFinishAt !== null && (
          <span>DNF: {format(item.didNotFinishAt, 'PP')}</span>
        )}
        <Select
          onChange={(value) => updatePileItem(item.id, { status: (value as PileItemStatus) })}
          value={item.status}
        >
          <option value={PileItemStatus.QUEUED}>Queued</option>
          <option value={PileItemStatus.FINISHED}>Listened</option>
          <option value={PileItemStatus.DID_NOT_FINISH}>Did Not Finish</option>
        </Select>
        <button onClick={() => setEditingNotes((s) => !s)}>
          {editingNotes ? 'View Album' : 'Edit Notes'}
        </button>
        <button onClick={() => deletePileItem(item.id)}>
          Remove
        </button>
      </div>
    </li>
  );
}
