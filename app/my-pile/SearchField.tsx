'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useFloating, useDismiss, useInteractions, autoUpdate } from '@floating-ui/react';
import { format } from 'date-fns';
import { IReleaseGroupList } from 'musicbrainz-api';

import useDebounce from '@/app/util/useDebounce';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeading,
  DialogDescription,
  DialogClose,
} from '@/app/components/Dialog';
import { createPileItem, searchForNewItems } from './actions';
import styles from './SearchField.module.scss';

export default function SearchField() {
  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedSearchValue = useDebounce(searchValue);
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<IReleaseGroupList | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    startTransition(async () => {
      if (!debouncedSearchValue.length) return;
      const result = await searchForNewItems(debouncedSearchValue);
      setResults(result);
      console.log('search result', result);
    });
  }, [debouncedSearchValue, setResults]);

  const handleAddToPile = useCallback(async (
    result: IReleaseGroupList['release-groups'][0]
  ) => {
    await createPileItem({
      albumName: result.title,
      artistName: result['artist-credit'].map(artist => artist.name).join(', '),
      musicBrainzReleaseGroupId: result.id,
    });
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  return (
    <>
    <button type="button" onClick={() => setIsDialogOpen(true)}>
      Add Item
    </button>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeading>Add to Pile</DialogHeading>
        <DialogDescription>
        <input
          className={styles.searchInput}
          type="text"
          onChange={(event) => setSearchValue(event.target.value)}
          value={searchValue}
        />
        {results && (results.count ?? false) && (
          <ol>
            {results['release-groups'].map((result) => (
              <li key={result.id} className={styles.resultItem}>
                <img
                  loading="lazy"
                  src={`https://coverartarchive.org/release-group/${result.id}/front-200`}
                  alt=""
                />
                <div className={styles.albumSection}>
                  <span className={styles.album}>
                    {result.title}
                  </span>
                  <span className={styles.artist}>
                    {result['artist-credit'].map(artist => artist.name).join(', ')}
                  </span>
                </div>
                <div className={styles.controls}>
                  <span>
                    Release Date: {result['first-release-date'] ?? 'Unknown'}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                  >
                    View (TODO)
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAddToPile(result)}
                  >
                    Add to Pile
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
