'use server';
import { dbSource } from '@/app/models';
import { getPileItems, createPileItem } from './actions';
import AddToPile from './AddToPile';
import FilterBar from './FilterBar';
import PileItem from './PileItem';
import logo from './logo.svg';
import styles from './page.module.scss';

export default async function MyPilePage(props: {
  searchParams?: Promise<{
    query?: string;
    filters?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams ?? {};
  const pileItems = await getPileItems({
    searchQuery: searchParams.query,
    filters: searchParams.filters ? JSON.parse(searchParams.filters) : undefined,
  });

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <img src={logo.src} alt="RecordPile logo" />
        <AddToPile />
      </header>
      <FilterBar />
      <ol className={styles.pile}>
        {pileItems.map((item) => (
          <PileItem key={item.id} item={item} />
        ))}
      </ol>
    </main>
  );
}
