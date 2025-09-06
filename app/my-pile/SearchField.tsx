'use client';
import { useEffect, useState, useTransition } from 'react';
import { useFloating, useDismiss, useInteractions, autoUpdate } from '@floating-ui/react';
import { IReleaseGroupList } from 'musicbrainz-api';
import useDebounce from '@/app/util/useDebounce';
import { searchForNewItems } from './actions';
import styles from './SearchField.module.scss';

export default function SearchField() {
  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedSearchValue = useDebounce(searchValue);
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<IReleaseGroupList | null>(null);

  const [resultsOpen, setResultsOpen] = useState<boolean>(false);
  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    open: resultsOpen,
    onOpenChange: setResultsOpen,
    whileElementsMounted: autoUpdate,
  });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
  ]);

  useEffect(() => {
    startTransition(async () => {
      if (!debouncedSearchValue.length) return;
      const result = await searchForNewItems(debouncedSearchValue);
      setResults(result);
      console.log('search result', result);
      setResultsOpen(true);
    });
  }, [debouncedSearchValue, setResults]);

  return (
    <>
      <input
        ref={refs.setReference}
        className={styles.searchInput}
        type="text"
        onChange={(event) => setSearchValue(event.target.value)}
        value={searchValue}
        {...getReferenceProps()}
      />
      {resultsOpen && results && (results.count ?? false) && (
        <div
          ref={refs.setFloating}
          className={styles.resultsPanel}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          <ol>
            {results['release-groups'].map((result) => (
              <li key={result.id} className={styles.resultItem}>
                <img
                  loading="lazy"
                  src={`https://coverartarchive.org/release-group/${result.id}/front-200`}
                  alt=""
                />
                <span>
                  "{result.title ?? '[[No Title]]'}"
                </span>
                <span>
                  {result['artist-credit'].map(artist => artist.name).join(', ') ?? '[[No Artist ]]'}
                </span>
                <span>
                  {result['first-release-date'] ?? '[[No Date]]'}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
