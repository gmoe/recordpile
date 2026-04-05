'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { cva } from 'class-variance-authority';
import { ArrowUpDown, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

import { PileItemStatus, PileItemStatusLabels } from '@/app/db/schemas/pileItems';
import SearchInput from '@/app/components/SearchInput';
import Select from '@/app/components/Select';
import useDebounce from '@/app/util/useDebounce';
import type { PileItemSearchFilters } from '../actions';
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

type SortContract = NonNullable<PileItemSearchFilters['sort']>;
type SortStateValue = `${SortContract['field']}-${SortContract['order']}`;

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

  const [sortValue, setSortValue] = useState<SortStateValue>(
    searchParams.get('sortField') && searchParams.get('sortDirection')
      ?  `${searchParams.get('sortField') as SortContract['field']}-${searchParams.get('sortDirection') as SortContract['order']}`
      : 'orderIndex-DESC'
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    const serializedFilters = {
      status: [filters.status],
    };
    params.set('filters', JSON.stringify(serializedFilters));

    if (filters.status === PileItemStatus.QUEUED) {
      const [sortField, sortDirection] = sortValue.split('-');
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
  }, [debouncedSearchQuery, filters, sortValue, pathname, replace, searchParams]);

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
          onClick={() => {
            setFilters((s) => ({
              ...s,
              status: PileItemStatus.QUEUED,
            }));
            setSortValue('orderIndex-DESC');
          }}
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
      {filters.status === PileItemStatus.QUEUED && (
        <div className={styles.sorting}>
          <ArrowUpDown className={styles.sortIcon} />
          <Select
            id="sortBySelect"
            aria-label="Sort By"
            onChange={(value) => setSortValue(value as SortStateValue)}
            value={sortValue}
          >
            <option value="orderIndex-DESC">My Order</option>
            <option value="artistName-ASC">
              <span>Artist</span>
              <ArrowUpAZ className={styles.sortIcon} />
            </option>
            <option value="artistName-DESC">
              <span>Artist</span>
              <ArrowDownAZ className={styles.sortIcon} />
            </option>
            <option value="albumName-ASC">
              <span>Album</span>
              <ArrowUpAZ className={styles.sortIcon} />
            </option>
            <option value="albumName-DESC">
              <span>Album</span>
              <ArrowDownAZ className={styles.sortIcon} />
            </option>
            <option value="addedAt-ASC">
              <span>Added At </span>
              <ArrowUpAZ className={styles.sortIcon} />
            </option>
            <option value="addedAt-DESC">
              <span>Added At </span>
              <ArrowDownAZ className={styles.sortIcon} />
            </option>
          </Select>
        </div>
      )}
    </div>
  );
}
