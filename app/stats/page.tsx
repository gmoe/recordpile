'use server';
import AverageDaysCompletion from './charts/AverageDaysCompletion';
import styles from './page.module.scss';

export default async function Stats() {
  return (
    <div className={styles.charts}>
      <AverageDaysCompletion />
    </div>
  );
}
