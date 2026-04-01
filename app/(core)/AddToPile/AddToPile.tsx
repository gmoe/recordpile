'use client';
import { useCallback, useState, useTransition } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';

import type { MBResultList } from '@/app/util/musicBrainz';
import {
  Dialog,
  DialogContent,
  DialogHeading,
  DialogDescription,
} from '@/app/components/Dialog';
import SearchInput from '@/app/components/SearchInput';
import { createPileItem, searchForNewItems, type ClientReleaseGroup } from '../my-pile/actions';
import styles from './AddToPile.module.scss';

export default function AddToPile() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearchFetching, startSearchTransition] = useTransition();
  const [isAddingItem, startAddTransition] = useTransition();
  const [results, setResults] = useState<MBResultList<ClientReleaseGroup> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleSearch = useCallback(() => {
    startSearchTransition(async () => {
      if (!searchValue.length) return;
      const result = await searchForNewItems(searchValue);
      setResults(result);
    });
  }, [searchValue, setResults]);

  const handleAddToPile = useCallback((
    item: ClientReleaseGroup
  ) => {
    startAddTransition(async () => {
      await createPileItem({
        albumName: item.title,
        artistName: item.artistCredit.map(artist => artist.name).join(', '),
        musicBrainzReleaseGroupId: item.id,
      });
      setSearchValue('');
      setResults(null);
      setIsDialogOpen(false);
    });
  }, [setSearchValue, setResults, setIsDialogOpen]);

  return (
    <>
    <button type="button" onClick={() => setIsDialogOpen(true)}>
      <Plus />
      <span>Add Item</span>
    </button>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeading>Add to Pile</DialogHeading>
        <DialogDescription className={styles.content}>
          <form className={styles.searchForm} action={handleSearch}>
            <SearchInput
              autoFocus
              isLoading={isSearchFetching}
              onChange={(event) => setSearchValue(event.target.value)}
              onClear={() => setSearchValue('')}
              value={searchValue}
            />
            <button type="submit">Search</button>
          </form>
        {results && (results.count ?? false) && (
          <ol className={styles.results}>
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
                    disabled
                  >
                    View (TODO)
                  </button>
                  <button
                    type="button"
                    disabled={isSearchFetching || isAddingItem || result.inPile}
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
      </DialogContent>
    </Dialog>
    </>
  );
}
