'use server';
import { dbSource } from '@/app/models';
import { getPileItems, createPileItem } from './actions';
import AddToPile from './AddToPile';
import FilterBar from './FilterBar';
import PileItems from './PileItems';
import logo from './logo.svg';
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
    <main className={styles.main}>
      <header className={styles.header}>
        <img src={logo.src} alt="RecordPile logo" />
        <AddToPile />
      </header>
      <FilterBar />
      <PileItems pileItems={pileItems} />
    </main>
  );
}
