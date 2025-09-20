import chartStyles from '../charts.module.scss';
import styles from './LoadingSkeleton';

export default function LoadingSkeleton() {
  return (
    <div className={chartStyles.container}>
      Loading...
    </div>
  );
}
