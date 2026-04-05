import { Suspense } from 'react';

import { getSessionOrRedirect } from '@/app/lib/auth';
import PileItemsContainer from './PileItemsContainer';

export default async function MyPilePage() {
  await getSessionOrRedirect();

  return (
    <Suspense>
      <PileItemsContainer />
    </Suspense>
  );
}
