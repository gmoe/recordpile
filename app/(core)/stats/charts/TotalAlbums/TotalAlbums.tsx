'use server';
import { getTotalAlbumCount } from '../actions';
import chartStyles from '../charts.module.scss';
import styles from './TotalAlbums.module.scss';

const intl = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

export default async function TotalAlbums() {
  const total = await getTotalAlbumCount('30days');

  return (
    <div className={chartStyles.container}>
      <div className={styles.total}>
        <span>Total Albums</span>
        <span className={styles.data}>
          {total ? intl.format(total) : 'Unknown'}
        </span>
        <span>Days</span>
      </div>
    </div>
  );
}
