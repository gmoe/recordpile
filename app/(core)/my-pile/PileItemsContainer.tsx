'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateKeyBetween } from 'fractional-indexing';

import { PileItemStatus } from '@/app/db/schemas/pileItems';
import { type ClientPileItem } from './actions';
import { saveItems, getItems, updateItem } from '@/app/lib/itemStore';
import { enqueue, dequeue, getAll, incrementRetry } from '@/app/lib/offlineQueue';
import { useQueueFlush } from '@/app/lib/useOfflineMutation';
import PileItems from './PileItems';
import FilterBar from './FilterBar';
import styles from './page.module.scss';

export type ReorderDirection = 'up-one' | 'to-top' | 'down-one' | 'to-bottom';

function applyFilters(items: ClientPileItem[], searchParams: URLSearchParams): ClientPileItem[] {
  const rawFilters = searchParams.get('filters');
  const filters = rawFilters ? JSON.parse(rawFilters) : {};
  const query = searchParams.get('query')?.toLowerCase() ?? '';
  const sortField = searchParams.get('sortField') ?? 'position';
  const sortDirection = searchParams.get('sortDirection') ?? 'ASC';

  let result = [...items];

  // Status filter
  if (filters.status?.length) {
    result = result.filter((item) => filters.status.includes(item.status));
  }

  // Owned filter
  if (filters.owned !== undefined) {
    result = result.filter((item) => item.owned === filters.owned);
  }

  // Search query
  if (query) {
    result = result.filter(
      (item) =>
        item.artistName.toLowerCase().includes(query) ||
        item.albumName.toLowerCase().includes(query)
    );
  }

  // Sort
  result.sort((a, b) => {
    let aVal: string | number | Date | null | undefined;
    let bVal: string | number | Date | null | undefined;

    switch (sortField) {
      case 'position':
        aVal = a.position;
        bVal = b.position;
        break;
      case 'artistName':
        aVal = a.artistName.toLowerCase();
        bVal = b.artistName.toLowerCase();
        break;
      case 'albumName':
        aVal = a.albumName.toLowerCase();
        bVal = b.albumName.toLowerCase();
        break;
      case 'addedAt':
        aVal = a.addedAt ? new Date(a.addedAt).getTime() : 0;
        bVal = b.addedAt ? new Date(b.addedAt).getTime() : 0;
        break;
      case 'finishedAt':
        aVal = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
        bVal = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
        break;
      case 'didNotFinishAt':
        aVal = a.didNotFinishAt ? new Date(a.didNotFinishAt).getTime() : 0;
        bVal = b.didNotFinishAt ? new Date(b.didNotFinishAt).getTime() : 0;
        break;
      default:
        aVal = a.position;
        bVal = b.position;
    }

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === 'DESC' ? -cmp : cmp;
  });

  // Secondary sort by id for stable tie-breaking
  result.sort((a, b) => {
    const aVal = sortField === 'position' ? a.position : null;
    const bVal = sortField === 'position' ? b.position : null;
    if (aVal !== bVal) return 0;
    return a.id < b.id ? -1 : 1;
  });

  return result;
}

export default function PileItemsContainer() {
  const searchParams = useSearchParams();
  const [allItems, setAllItems] = useState<ClientPileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndCacheItems = useCallback(async () => {
    try {
      const res = await fetch('/api/pile-items');
      if (!res.ok) return;
      const fresh: ClientPileItem[] = await res.json();
      await saveItems(fresh);
      setAllItems(fresh);
    } catch {
      // Network error — silently ignore, IndexedDB state remains
    }
  }, []);

  useEffect(() => {
    // Load from IndexedDB immediately (works offline)
    getItems().then((cached) => {
      if (cached.length > 0) {
        setAllItems(cached);
        setIsLoading(false);
      }
    });

    // Fetch fresh data from server if online
    if (navigator.onLine) {
      fetchAndCacheItems().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    // Listen for new items added from AddToPile
    const handleItemsChanged = () => fetchAndCacheItems();
    window.addEventListener('pile-items-changed', handleItemsChanged);
    return () => window.removeEventListener('pile-items-changed', handleItemsChanged);
  }, [fetchAndCacheItems]);

  // Flush any queued mutations when back online
  const { flush } = useQueueFlush(fetchAndCacheItems);
  useEffect(() => {
    // Flush on mount in case there are leftover queued mutations
    if (navigator.onLine) flush();

    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [flush]);

  const handleReorder = useCallback(
    async (itemId: string, direction: ReorderDirection) => {
      // Use position-sorted items (ignoring current filters) for reorder calculations
      const sorted = [...allItems].sort((a, b) =>
        a.position < b.position ? -1 : a.position > b.position ? 1 : 0
      );
      const index = sorted.findIndex((i) => i.id === itemId);
      if (index === -1) return;

      let newPosition: string;
      try {
        switch (direction) {
          case 'up-one':
            newPosition = generateKeyBetween(
              sorted[index - 2]?.position ?? null,
              sorted[index - 1].position
            );
            break;
          case 'to-top':
            newPosition = generateKeyBetween(null, sorted[0].position);
            break;
          case 'down-one':
            newPosition = generateKeyBetween(
              sorted[index + 1].position,
              sorted[index + 2]?.position ?? null
            );
            break;
          case 'to-bottom':
            newPosition = generateKeyBetween(sorted[sorted.length - 1].position, null);
            break;
        }
      } catch {
        // generateKeyBetween can throw if keys are malformed — bail out
        return;
      }

      const timestamp = new Date().toISOString();
      const payload = { position: newPosition, positionUpdatedAt: timestamp };

      // Optimistic update
      await updateItem(itemId, payload);
      setAllItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...payload } : item))
      );

      if (!navigator.onLine) {
        await enqueue(itemId, payload);
        return;
      }

      try {
        const res = await fetch(`/api/pile-items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchAndCacheItems();
        } else if (res.status === 409) {
          const serverState = await res.json();
          if (serverState.serverPosition) {
            await updateItem(itemId, { position: serverState.serverPosition });
            setAllItems((prev) =>
              prev.map((item) =>
                item.id === itemId ? { ...item, position: serverState.serverPosition } : item
              )
            );
          }
          fetchAndCacheItems();
        }
      } catch {
        await enqueue(itemId, payload);
      }
    },
    [allItems, fetchAndCacheItems]
  );

  const filteredItems = applyFilters(allItems, searchParams);

  if (isLoading && allItems.length === 0) {
    return (
      <section className={styles.pileContent}>
        <FilterBar />
      </section>
    );
  }

  return (
    <section className={styles.pileContent}>
      <FilterBar />
      <PileItems
        pileItems={filteredItems}
        onReorder={handleReorder}
        onSyncComplete={fetchAndCacheItems}
      />
    </section>
  );
}
