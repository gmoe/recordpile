import { ClientPileItem } from '../actions';
import PileItem from './PileItem';
import styles from './PileItems.module.scss';

interface PileItemsProps {
  pileItems: ClientPileItem[];
}

export default function PileItems({ pileItems }: PileItemsProps) {
  return (
    <ol className={styles.pile}>
      {pileItems.map((item) => (
        <PileItem key={item.id} item={item} />
      ))}
    </ol>
  );
}
