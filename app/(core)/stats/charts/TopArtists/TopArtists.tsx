import { getTopArtistsHeard } from '../actions';
import chartStyles from '../charts.module.scss';
import styles from './TopArtists.module.scss';

export default async function TopArtists() {
  const topArtists = await getTopArtistsHeard('30days');

  return (
    <div className={`${chartStyles.container} ${styles.container}`}>
      <div>
        <h2 className={styles.title}>Top Artists</h2>
      </div>
      <ol className={styles.artists}>
        {topArtists.map(({ artistName, count }) => (
          <li key={artistName}>
            {artistName} – {count}
          </li>
        ))}
      </ol>
    </div>
  );
}
