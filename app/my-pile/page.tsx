'use server';
import { dbSource } from '@/app/models';
import { getPileItems, createPileItem } from './actions';
import SearchField from './SearchField';
import PileItem from './PileItem';
import logo from './logo.svg';
import styles from './page.module.scss';

export default async function MyPilePage() {
  const pileItems = await getPileItems();

  console.log(pileItems);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <img src={logo.src} alt="RecordPile logo" />
        <SearchField />
      </header>
      <ol className={styles.pile}>
        {pileItems.map((item) => (
          <PileItem key={item.id} item={item} />
        ))}
      </ol>
    </main>
  );
}
