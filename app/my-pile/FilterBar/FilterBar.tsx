'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { cva } from 'class-variance-authority';
import { PileItemStatus, PileItemStatusLabels } from '@/app/models/PileItemTypes';
import SearchInput from '@/app/components/SearchInput';
import useDebounce from '@/app/util/useDebounce';
import styles from './FilterBar.module.scss';

const filterCva = cva(styles.filter, {
  variants: {
    active: {
      true: styles.active,
    },
  },
});

type FilterState = {
  status: Record<PileItemStatus, boolean>;
};

export default function FilterBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const paramsFilters = JSON.parse(searchParams.get('filters') ?? '{}');
  const initStatusFilter = paramsFilters?.status ?? [PileItemStatus.QUEUED];

  const [filters, setFilters] = useState<FilterState>({
    status: {
      [PileItemStatus.QUEUED]: initStatusFilter.includes(PileItemStatus.QUEUED),
      [PileItemStatus.LISTENED]: initStatusFilter.includes(PileItemStatus.LISTENED),
      [PileItemStatus.DID_NOT_FINISH]: initStatusFilter.includes(PileItemStatus.DID_NOT_FINISH),
    },
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    const serializedFilters = {
      status: (Object.keys(filters.status) as PileItemStatus[]).reduce((acc, statusKey) => {
        if (filters.status[statusKey ]) {
          return [...acc, statusKey];
        }
        return acc;
      }, [] as PileItemStatus[]),
    };
    params.set('filters', JSON.stringify(serializedFilters));

    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }

    replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery, filters, pathname]);

  return (
    <div className={styles.filterBar}>
      <SearchInput
        isLoading={debouncedSearchQuery !== searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onClear={() => setSearchQuery('')}
        value={searchQuery}
      />
      <div className={styles.statusFilter}>
        <button
          role="switch"
          aria-checked={filters.status[PileItemStatus.QUEUED]}
          className={filterCva({ active: filters.status[PileItemStatus.QUEUED] })}
          onClick={() => setFilters((s) => ({
            ...s,
            status: {
              ...s.status,
              [PileItemStatus.QUEUED]: !s.status[PileItemStatus.QUEUED],
              [PileItemStatus.LISTENED]: false,
              [PileItemStatus.DID_NOT_FINISH]: false,
            },
          }))}
        >
          {PileItemStatusLabels[PileItemStatus.QUEUED]}
        </button>
        <button
          role="switch"
          aria-checked={filters.status[PileItemStatus.LISTENED]}
          className={filterCva({ active: filters.status[PileItemStatus.LISTENED] })}
          onClick={() => setFilters((s) => ({
            ...s,
            status: {
              ...s.status,
              [PileItemStatus.QUEUED]: false,
              [PileItemStatus.LISTENED]: !s.status[PileItemStatus.LISTENED],
              [PileItemStatus.DID_NOT_FINISH]: false,
            },
          }))}
        >
          {PileItemStatusLabels[PileItemStatus.LISTENED]}
        </button>
        <button
          role="switch"
          aria-checked={filters.status[PileItemStatus.DID_NOT_FINISH]}
          className={filterCva({ active: filters.status[PileItemStatus.DID_NOT_FINISH] })}
          onClick={() => setFilters((s) => ({
            ...s,
            status: {
              ...s.status,
              [PileItemStatus.QUEUED]: false,
              [PileItemStatus.LISTENED]: false,
              [PileItemStatus.DID_NOT_FINISH]: !s.status[PileItemStatus.DID_NOT_FINISH],
            },
          }))}
        >
          {PileItemStatusLabels[PileItemStatus.DID_NOT_FINISH]}
        </button>
      </div>
    </div>
  );
}
