import chartStyles from '../charts.module.scss';

export default function LoadingSkeleton() {
  return (
    <div className={chartStyles.container}>
      Loading...
    </div>
  );
}
