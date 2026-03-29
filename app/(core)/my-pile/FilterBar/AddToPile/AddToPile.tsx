'use client';
import { useCallback, useState, useTransition } from 'react';
import Image from 'next/image';

import type { MBResultList } from '@/app/util/musicBrainz';
import {
  Dialog,
  DialogContent,
  DialogHeading,
  DialogDescription,
  DialogClose,
} from '@/app/components/Dialog';
import SearchInput from '@/app/components/SearchInput';
import { createPileItem, searchForNewItems, type ClientReleaseGroup } from '../../actions';
import styles from './AddToPile.module.scss';

export default function AddToPile() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<MBResultList<ClientReleaseGroup> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleSearch = useCallback(() => {
    startTransition(async () => {
      if (!searchValue.length) return;
      const result = await searchForNewItems(searchValue);
      setResults(result);
    });
  }, [searchValue, setResults]);

  const handleAddToPile = useCallback(async (
    item: ClientReleaseGroup
  ) => {
    await createPileItem({
      albumName: item.title,
      artistName: item.artistCredit.map(artist => artist.name).join(', '),
      musicBrainzReleaseGroupId: item.id,
    });
    setSearchValue('');
    setResults(null);
    setIsDialogOpen(false);
  }, [setSearchValue, setResults, setIsDialogOpen]);

  return (
    <>
    <button type="button" onClick={() => setIsDialogOpen(true)}>
      Add Item
    </button>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeading>Add to Pile</DialogHeading>
        <DialogDescription>
          <form action={handleSearch}>
            <SearchInput
              autoFocus
              onChange={(event) => setSearchValue(event.target.value)}
              onClear={() => setSearchValue('')}
              value={searchValue}
            />
          </form>
        {results && (results.count ?? false) && (
          <ol>
            {results.results.map((result) => (
              <li key={result.id} className={styles.resultItem}>
                <Image
                  loading="lazy"
                  width={200}
                  height={200}
                  src={`https://coverartarchive.org/release-group/${result.id}/front-200`}
                  alt=""
                />
                <div className={styles.albumSection}>
                  <span className={styles.album}>
                    {result.title}
                  </span>
                  <span className={styles.artist}>
                    {result.artistCredit.map(artist => artist.name).join(', ')}
                  </span>
                </div>
                <div className={styles.controls}>
                  <span>
                    Release Date: {result.firstReleaseDate ?? 'Unknown'}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                  >
                    View (TODO)
                  </button>
                  <button
                    type="button"
                    disabled={isPending || result.inPile}
                    onClick={() => handleAddToPile(result)}
                  >
                    {result.inPile ? 'Already In Pile' : 'Add to Pile'}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        </DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
    </>
  );
}
