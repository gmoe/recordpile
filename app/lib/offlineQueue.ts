import type { PileItemStatus } from '@/app/db/schemas/pileItems';

const DB_NAME = 'recordpile-offline';
const DB_VERSION = 1;
const STORE_NAME = 'mutation-queue';

export interface MutationPayload {
  status?: PileItemStatus;
  statusUpdatedAt?: string;
  notes?: string;
  notesUpdatedAt?: string;
  owned?: boolean;
  ownedUpdatedAt?: string;
  position?: string;
  positionUpdatedAt?: string;
}

export interface QueuedMutation {
  id: string;
  pileItemId: string;
  payload: MutationPayload;
  createdAt: string;
  retries: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('item-cache')) {
        db.createObjectStore('item-cache', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('mutation-queue')) {
        const store = db.createObjectStore('mutation-queue', { keyPath: 'id' });
        store.createIndex('pileItemId', 'pileItemId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function mergePayloads(existing: MutationPayload, incoming: MutationPayload): MutationPayload {
  const merged = { ...existing };

  const fields = ['status', 'notes', 'owned', 'position'] as const;
  for (const field of fields) {
    const tsField = `${field}UpdatedAt` as keyof MutationPayload;
    const incomingTs = incoming[tsField] ? new Date(incoming[tsField] as string).getTime() : 0;
    const existingTs = existing[tsField] ? new Date(existing[tsField] as string).getTime() : 0;
    if (incomingTs > existingTs) {
      (merged as Record<string, unknown>)[field] = incoming[field as keyof MutationPayload];
      (merged as Record<string, unknown>)[tsField] = incoming[tsField];
    }
  }

  return merged;
}

export async function enqueue(
  pileItemId: string,
  payload: MutationPayload
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('pileItemId');
    const findReq = index.getAll(pileItemId);

    findReq.onsuccess = () => {
      const existing: QueuedMutation[] = findReq.result;
      if (existing.length > 0) {
        // Coalesce: merge into the existing entry
        const merged = existing[0];
        merged.payload = mergePayloads(merged.payload, payload);
        store.put(merged);
      } else {
        const entry: QueuedMutation = {
          id: crypto.randomUUID(),
          pileItemId,
          payload,
          createdAt: new Date().toISOString(),
          retries: 0,
        };
        store.add(entry);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    findReq.onerror = () => reject(findReq.error);
  });
}

export async function dequeue(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAll(): Promise<QueuedMutation[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as QueuedMutation[]);
    req.onerror = () => reject(req.error);
  });
}

export async function incrementRetry(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item: QueuedMutation = getReq.result;
      if (item) {
        store.put({ ...item, retries: item.retries + 1 });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
