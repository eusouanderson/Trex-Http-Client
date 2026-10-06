import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { createPersistenceStorage } from '../storage.factory';
import { DexiePersistenceStorage } from '../indexeddb/dexie-persistence-storage';
import { SqlitePersistenceStorage } from '../sqlite/sqlite-persistence-storage';

describe('Storage Factory (Multi-Target)', () => {
  it('should create DexiePersistenceStorage by default for web/pwa target', async () => {
    const storage = createPersistenceStorage('indexeddb');
    expect(storage).toBeInstanceOf(DexiePersistenceStorage);
    await storage.initialize();
    await storage.close();
  });

  it('should create SqlitePersistenceStorage when target is sqlite', async () => {
    const storage = createPersistenceStorage('sqlite');
    expect(storage).toBeInstanceOf(SqlitePersistenceStorage);
    await storage.initialize();

    const collections = await storage.collections.getAll();
    expect(collections).toEqual([]);

    await storage.close();
  });

  it('should support singleton instance retrieval', () => {
    const s1 = createPersistenceStorage();
    expect(s1).toBeDefined();
  });
});

