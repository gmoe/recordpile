'use server';

import { getSessionOrRedirect } from '@/app/lib/auth';
import { getPileItems } from './actions';
import FilterBar from './FilterBar';
import PileItems from './PileItems';
import styles from './page.module.scss';

type GetPileItemsSort = NonNullable<NonNullable<NonNullable<Parameters<typeof getPileItems>>[0]>['sort']>;

export default async function MyPilePage(props: {
  searchParams?: Promise<{
    query?: string;
    filters?: string;
    sortField?: GetPileItemsSort['field'];
    sortDirection?: GetPileItemsSort['order'];
    page?: string;
  }>;
}) {
  await getSessionOrRedirect();
  const searchParams = await props.searchParams ?? {};
  const pileItems = await getPileItems({
    searchQuery: searchParams.query,
    filters: searchParams.filters ? JSON.parse(searchParams.filters) : undefined,
    sort: {
      field: searchParams.sortField ?? 'orderIndex',
      order: searchParams.sortDirection ?? 'DESC',
    }
  });

  return (
    <section className={styles.pileContent}>
      <FilterBar />
      <PileItems pileItems={pileItems} />
    </section>
  );
}
