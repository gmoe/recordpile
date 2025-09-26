'use server';
import { getAverageTimeToListen } from '../actions';
import chartStyles from '../charts.module.scss';
import styles from './AverageDaysCompletion.module.scss';

const intl = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

export default async function AverageDaysCompletion() {
  const average = await getAverageTimeToListen();

  return (
    <div className={chartStyles.container}>
      <div className={styles.average}>
        <span>Average time to finish</span>
        <span className={styles.data}>
          {average ? intl.format(average) : 'Unknown'}
        </span>
        <span>Days</span>
      </div>
    </div>
  );
}
