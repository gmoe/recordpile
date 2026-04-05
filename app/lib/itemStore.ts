import type { ClientPileItem } from '@/app/(core)/my-pile/actions';

const DB_NAME = 'recordpile-offline';
const DB_VERSION = 1;
const STORE_NAME = 'item-cache';

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

export async function saveItems(items: ClientPileItem[]): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const item of items) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getItems(): Promise<ClientPileItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as ClientPileItem[]);
    req.onerror = () => reject(req.error);
  });
}

export async function updateItem(
  id: string,
  patch: Partial<ClientPileItem>
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) {
        resolve();
        return;
      }
      store.put({ ...existing, ...patch });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
