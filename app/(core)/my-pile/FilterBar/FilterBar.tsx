'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { cva } from 'class-variance-authority';

import { PileItemStatus, PileItemStatusLabels } from '@/app/db/schemas/pileItems';
import SearchInput from '@/app/components/SearchInput';
import Select from '@/app/components/Select';
import useDebounce from '@/app/util/useDebounce';
import AddToPile from './AddToPile';
import styles from './FilterBar.module.scss';

const filterCva = cva(styles.filter, {
  variants: {
    selected: {
      true: styles.selected,
    },
  },
});

type FilterState = {
  status: PileItemStatus;
};

export default function FilterBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const paramsFilters = JSON.parse(searchParams.get('filters') ?? '{}');
  const initStatusFilter = (paramsFilters?.status ?? [PileItemStatus.QUEUED])[0];

  const [filters, setFilters] = useState<FilterState>({
    status: initStatusFilter,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  const [sortField, setSortField] = useState<string>('orderIndex');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    const serializedFilters = {
      status: [filters.status],
    };
    params.set('filters', JSON.stringify(serializedFilters));

    if (filters.status === PileItemStatus.QUEUED) {
      params.set('sortField', sortField);
      params.set('sortDirection', sortDirection);
    } else if (filters.status === PileItemStatus.FINISHED) {
      params.set('sortField', 'finishedAt');
      params.set('sortDirection', 'DESC');
    } else if (filters.status === PileItemStatus.DID_NOT_FINISH) {
      params.set('sortField', 'didNotFinishAt');
      params.set('sortDirection', 'DESC');
    }

    if (debouncedSearchQuery) {
      params.set('query', debouncedSearchQuery as string);
    } else {
      params.delete('query');
    }

    replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery, filters, sortField, sortDirection, pathname, replace, searchParams]);

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchContainer}>
        <SearchInput
          isLoading={debouncedSearchQuery !== searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery('')}
          value={searchQuery}
        />
      </div>
      <div className={styles.statusFilters}>
        <button
          role="switch"
          aria-checked={filters.status === PileItemStatus.QUEUED}
          className={filterCva({ selected: filters.status === PileItemStatus.QUEUED })}
          onClick={() => setFilters((s) => ({
            ...s,
            status: PileItemStatus.QUEUED,
          }))}
        >
          {PileItemStatusLabels[PileItemStatus.QUEUED]}
        </button>
        <button
          role="switch"
          aria-checked={filters.status === PileItemStatus.FINISHED}
          className={filterCva({ selected: filters.status === PileItemStatus.FINISHED })}
          onClick={() => setFilters((s) => ({
            ...s,
            status: PileItemStatus.FINISHED,
          }))}
        >
          {PileItemStatusLabels[PileItemStatus.FINISHED]}
        </button>
        <button
          role="switch"
          aria-checked={filters.status === PileItemStatus.DID_NOT_FINISH}
          className={filterCva({ selected: filters.status === PileItemStatus.DID_NOT_FINISH })}
          onClick={() => setFilters((s) => ({
            ...s,
            status: PileItemStatus.DID_NOT_FINISH,
          }))}
        >
          {PileItemStatusLabels[PileItemStatus.DID_NOT_FINISH]}
        </button>
      </div>
      <div className={styles.addTo}>
        <AddToPile />
      </div>
      {filters.status === PileItemStatus.QUEUED && (
        <div className={styles.sorting}>
          <label htmlFor="sortBySelect">
            Sort By:
          </label>
          <Select
            id="sortBySelect"
            onChange={(value) => setSortField(value as string)}
            value={sortField}
          >
            <option value="orderIndex">My Order</option>
            <option value="artistName">Artist Name</option>
            <option value="albumName">Album Name</option>
            <option value="addedAt">Added At</option>
          </Select>
          <Select
            onChange={(value) => setSortDirection(value as ('ASC' | 'DESC'))}
            value={sortDirection}
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </Select>
        </div>
      )}
    </div>
  );
}
