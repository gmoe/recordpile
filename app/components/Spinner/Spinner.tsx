'use client';
import { useId } from 'react';
import styles from './Spinner.module.scss';

const Sleeve = ({ className }: { className: string }) => (
  <svg className={className} width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M27 0C28.6569 3.86553e-07 30 1.34315 30 3V27C30 28.6569 28.6569 30 27 30H3C1.34315 30 2.416e-08 28.6569 0 27V3C3.8656e-07 1.34315 1.34315 2.41596e-08 3 0H27ZM15 10C12.2386 10 10 12.2386 10 15C10 17.7614 12.2386 20 15 20C17.7614 20 20 17.7614 20 15C20 12.2386 17.7614 10 15 10Z" fill="currentColor"/>
  </svg>
);

export default function Spinner({ label }: { label: string }) {
  const labelId = useId();

  return (
    <div className={styles.loading}>
      <div className={styles.spinner} aria-live="polite" aria-labelledby={labelId}>
        <Sleeve className={styles.topSleeve} />
        <Sleeve className={styles.bottomSleeve} />
      </div>
      <span id={labelId}>
        {label}
      </span>
    </div>
  );
}
