'use client';
import { format } from 'date-fns';
import { PileItemStatusLabels } from '@/app/models/PileItemTypes';
import { ClientPileItem } from '../actions';
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
        <p>Added: {format(item.addedAt, 'PP')}</p>
        <p>Status: {PileItemStatusLabels[item.status]}</p>
      </div>
    </li>
  );
}
