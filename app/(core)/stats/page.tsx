'use server';
import { Suspense } from 'react';

import { getSessionOrRedirect } from '@/app/lib/auth';
import LoadingSkeleton from './charts/LoadingSkeleton';
import AverageDaysCompletion from './charts/AverageDaysCompletion';
import ListeningHistory from './charts/ListeningHistory';
import TopArtists from './charts/TopArtists';
import { getNumberAlbumsHeard } from './charts/actions';
import styles from './page.module.scss';

export default async function Stats() {
  await getSessionOrRedirect();
  const albumHistory = getNumberAlbumsHeard('month');

  return (
    <div className={styles.charts}>
      <AverageDaysCompletion />
      <Suspense fallback={<LoadingSkeleton />}>
        <ListeningHistory albumHistory={albumHistory} />
      </Suspense>
      <TopArtists />
    </div>
  );
}
