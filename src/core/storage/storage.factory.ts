import type { IPersistenceStorage, PersistenceTarget } from './interfaces';
import { DexiePersistenceStorage } from './indexeddb/dexie-persistence-storage';
import { SqlitePersistenceStorage } from './sqlite/sqlite-persistence-storage';

let defaultStorageInstance: IPersistenceStorage | null = null;

const createPersistenceStorage = (target: PersistenceTarget = 'indexeddb'): IPersistenceStorage => {
  if (target === 'sqlite') {
    return new SqlitePersistenceStorage();
  }
  return new DexiePersistenceStorage();
};

const getPersistenceStorage = (): IPersistenceStorage => {
  defaultStorageInstance ??= createPersistenceStorage('indexeddb');
  return defaultStorageInstance;
};

const setPersistenceStorage = (storage: IPersistenceStorage): void => {
  defaultStorageInstance = storage;
};

export {
  createPersistenceStorage,
  getPersistenceStorage,
  setPersistenceStorage,
};

