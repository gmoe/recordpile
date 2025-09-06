import { format } from 'date-fns';
import { dbSource, PileItem, PileItemStatusLabels } from '@/app/models';
import { getPileItems, createPileItem } from './actions';
import SearchField from './SearchField';
import styles from './page.module.scss';

export default async function MyPilePage() {
  const pileItems = await getPileItems();

  console.log(pileItems);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>My Pile</h1>
        <SearchField />
      </header>
      <ol className={styles.pile}>
        {pileItems.map((item) => (
          <li key={item.id} className={styles.item}>
            <img src={item.coverImageUrl} alt="" />
            <div className={styles.albumInfo}>
              <span className={styles.artist}>{item.artistName}</span>
              <span className={styles.album}>{item.albumName}</span>
            </div>
            <p>Added: {format(item.addedAt, 'PP')}</p>
            <p>Status: {PileItemStatusLabels[item.status]}</p>
          </li>
        ))}
      </ol>
      <form action={createPileItem} className={styles.createForm}>
        <fieldset>
          <label htmlFor="artistName">Artist Name</label>
          <input id="artistName" type="text" name="artistName" />
        </fieldset>

        <fieldset>
          <label htmlFor="albumName">Album Name</label>
          <input id="albumName" type="text" name="albumName" />
        </fieldset>

        <fieldset>
          <label htmlFor="coverImage">Album Art</label>
          <input id="coverImage" type="file" name="coverImage" />
        </fieldset>

        <button type="submit">Create</button>
      </form>
    </main>
  );
}
