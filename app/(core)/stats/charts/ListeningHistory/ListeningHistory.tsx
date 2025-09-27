'use client';
import { use, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import Chart from 'chart.js/auto';

import { type AlbumsHeardHistory } from '../actions';
import chartStyles from '../charts.module.scss';
import styles from './ListeningHistory.module.scss';

type ListeningHistoryProps = {
  albumHistory: Promise<AlbumsHeardHistory[]>;
};

export default function ListeningHistory({ albumHistory }: ListeningHistoryProps) {
  const chartData = use(albumHistory);
  const chartElRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'bar', string[], string> | null>(null);

  useEffect(() => {
    if (!chartElRef.current || !chartData) return;

    // Next.js does not support ICSS
    const rootStyles = getComputedStyle(document.documentElement);
    const foreground = rootStyles.getPropertyValue('--foreground').trim();

    chartRef.current = new Chart(
      chartElRef.current,
      {
        type: 'bar',
        data: {
          labels: chartData.map(row => format(row.finishedDay, 'MMMM d')),
            datasets: [
            {
              label: 'Listens this month',
              data: chartData.map(row => row.count),
              backgroundColor: foreground,
            }
          ]
        }
      }
    );

    return () => {
      chartRef.current?.destroy();
    };
  }, [chartElRef, chartData]);

  return (
    <div className={`${chartStyles.container} ${styles.chartContainer}`}>
      <canvas ref={chartElRef} />
    </div>
  );
}
