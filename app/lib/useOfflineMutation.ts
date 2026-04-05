'use client';

import { useCallback, useState } from 'react';

import type { ClientPileItem } from '@/app/(core)/my-pile/actions';
import { updateItem } from './itemStore';
import { enqueue, dequeue, getAll, incrementRetry, type MutationPayload } from './offlineQueue';

export type ConflictState = {
  serverStatus?: string;
  serverStatusUpdatedAt?: string | null;
  serverNotes?: string | null;
  serverNotesUpdatedAt?: string | null;
  serverOwned?: boolean;
  serverOwnedUpdatedAt?: string | null;
  serverPosition?: string;
  serverPositionUpdatedAt?: string | null;
};

type UsePileItemMutationOptions = {
  item: ClientPileItem;
  onOptimisticUpdate: (patch: Partial<Pick<ClientPileItem, 'status' | 'notes' | 'owned' | 'position'>>) => void;
  onConflict: (conflict: ConflictState) => void;
  onSyncComplete: () => void;
};

export function useOfflineMutation({
  item,
  onOptimisticUpdate,
  onConflict,
  onSyncComplete,
}: UsePileItemMutationOptions) {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (patch: Partial<Pick<ClientPileItem, 'status' | 'notes' | 'owned' | 'position'>>) => {
      const timestamp = new Date().toISOString();
      const payload: MutationPayload = {};

      if (patch.status !== undefined) {
        payload.status = patch.status;
        payload.statusUpdatedAt = timestamp;
      }
      if (patch.notes !== undefined) {
        payload.notes = patch.notes;
        payload.notesUpdatedAt = timestamp;
      }
      if (patch.owned !== undefined) {
        payload.owned = patch.owned;
        payload.ownedUpdatedAt = timestamp;
      }
      if (patch.position !== undefined) {
        payload.position = patch.position;
        payload.positionUpdatedAt = timestamp;
      }

      // Optimistic updates
      await updateItem(item.id, patch);
      onOptimisticUpdate(patch);

      setIsPending(true);
      try {
        if (!navigator.onLine) {
          await enqueue(item.id, payload);
          return;
        }

        let res: Response;
        try {
          res = await fetch(`/api/pile-items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {
          // Network error
          await enqueue(item.id, payload);
          return;
        }

        if (res.ok) {
          onSyncComplete();
          return;
        }

        if (res.status === 409) {
          const serverState: ConflictState = await res.json();
          // Revert conflicted fields in IndexedDB and local state
          const revert: Partial<ClientPileItem> = {};
          if (serverState.serverStatus !== undefined) {
            revert.status = serverState.serverStatus as ClientPileItem['status'];
          }
          if (serverState.serverNotes !== undefined) {
            revert.notes = serverState.serverNotes ?? undefined;
          }
          if (serverState.serverOwned !== undefined) {
            revert.owned = serverState.serverOwned;
          }
          if (serverState.serverPosition !== undefined) {
            revert.position = serverState.serverPosition;
          }
          if (Object.keys(revert).length > 0) {
            await updateItem(item.id, revert);
          }
          onConflict(serverState);
          onSyncComplete();
          return;
        }

        // Other server error — queue for retry
        await enqueue(item.id, payload);
      } finally {
        setIsPending(false);
      }
    },
    [item.id, onOptimisticUpdate, onConflict, onSyncComplete]
  );

  return { mutate, isPending };
}

// Queue flush hook — register once at a high level (PileItemsContainer)
export function useQueueFlush(onSyncComplete: () => void) {
  const flush = useCallback(async () => {
    const queue = await getAll();
    if (queue.length === 0) return;

    for (const mutation of queue) {
      try {
        const res = await fetch(`/api/pile-items/${mutation.pileItemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mutation.payload),
        });

        if (res.ok || res.status === 409) {
          await dequeue(mutation.id);
        } else {
          if (mutation.retries >= 3) {
            await dequeue(mutation.id);
          } else {
            await incrementRetry(mutation.id);
          }
        }
      } catch {
        // Network error — leave in queue for next flush
        if (mutation.retries >= 3) {
          await dequeue(mutation.id);
        } else {
          await incrementRetry(mutation.id);
        }
      }
    }

    onSyncComplete();
  }, [onSyncComplete]);

  return { flush };
}
