import parkengageDb from './parkengageDb.json';

export const DB_SCHEMA_VERSION = parkengageDb.schemaVersion;
export const DB_KEYS = parkengageDb.dbKeys;
export const DB_COLLECTIONS = parkengageDb.collections;

export type DbKeyName = keyof typeof DB_KEYS;
export type DbCollectionKey = keyof typeof DB_COLLECTIONS;

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function cloneSeed<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getSeedCollection<K extends DbCollectionKey>(key: K): (typeof DB_COLLECTIONS)[K] {
  return cloneSeed(DB_COLLECTIONS[key]);
}

export function readCollection<T>(storageKey: string, fallback: T): T {
  if (!hasStorage()) return cloneSeed(fallback);
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return cloneSeed(fallback);
    return JSON.parse(raw) as T;
  } catch {
    return cloneSeed(fallback);
  }
}

export function readSeededCollection<K extends DbCollectionKey>(key: K): (typeof DB_COLLECTIONS)[K] {
  return readCollection(key, DB_COLLECTIONS[key]);
}

export function writeCollection<T>(storageKey: string, value: T): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export function removeCollection(storageKey: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore storage errors
  }
}

export function readRawKey(storageKey: string, fallback: string | null = null): string | null {
  if (!hasStorage()) return fallback;
  try {
    const val = window.localStorage.getItem(storageKey);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

export function writeRawKey(storageKey: string, value: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // ignore storage errors
  }
}

export function exportDatabaseSnapshot(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  (Object.keys(DB_COLLECTIONS) as DbCollectionKey[]).forEach((collectionKey) => {
    snapshot[collectionKey] = readCollection(collectionKey, DB_COLLECTIONS[collectionKey]);
  });
  return snapshot;
}
