'use client';
import { format } from 'date-fns';
import { PileItemStatus, PileItemStatusLabels } from '@/app/models/PileItemTypes';
import Select from '@/app/components/Select';
import { ClientPileItem, updatePileItem, deletePileItem } from '../actions';
import missingArt from './missingArt.svg';
import styles from './PileItem.module.scss';

type PileItemProps = {
  item: ClientPileItem;
};

export default function PileItem({ item }: PileItemProps) {
  return (
    <li className={styles.item}>
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
