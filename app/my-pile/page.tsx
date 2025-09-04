import { format } from 'date-fns';
import { DiscogsClient } from '@lionralfs/discogs-client';
import { dbSource, PileItem } from '@/app/models';
import { getPileItems, createPileItem } from './actions';
import styles from './page.module.scss';

export default async function MyPilePage() {
  // const d = new DiscogsClient({
  //   userAgent: 'RecordPile/1.0.0',
  //   auth: {
  //     userToken: 'QtpiilBJraCzLHxKoOEGUUXUHztVZJgFjdaddZFJ',
  //   },
  // });

  // const collection = await d.user().collection().getReleases('nullchord', 0, {
  //   sort: 'added',
  //   sort_order: 'desc'
  // });

  // console.log(collection);

  const pileItems = await getPileItems();

  console.log(pileItems);

  return (
    <main className={styles.main}>
      <h1 className={styles.header}>My Pile</h1>
      <ol className={styles.pile}>
        {pileItems.map((item) => (
          <li key={item.id} className={styles.item}>
            <img src={item.coverImageUrl} alt="" />
            <div className={styles.albumInfo}>
              <span className={styles.artist}>{item.artistName}</span>
              <span className={styles.album}>{item.albumName}</span>
            </div>
            <p>Added: {format(item.createdAt, 'PP')}</p>
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
