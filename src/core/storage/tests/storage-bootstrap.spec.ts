import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializePersistence } from '../bootstrap';
import { getPersistenceStorage, setPersistenceStorage } from '../storage.factory';
import { DexiePersistenceStorage } from '../indexeddb/dexie-persistence-storage';

describe('Storage Bootstrap', () => {
  let storage: DexiePersistenceStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new DexiePersistenceStorage(`bootstrap-test-${Date.now().toString()}-${Math.random().toString()}`);
    setPersistenceStorage(storage);
  });

  afterEach(async () => {
    localStorage.clear();
    await storage.clearAll();
    await storage.close();
  });

  it('should initialize persistence storage and run legacy migrations', async () => {
    localStorage.setItem(
      'trex_environments',
      JSON.stringify([
        {
          id: 'env-boot',
          name: 'Env Boot',
          variables: [],
          createdAt: 100,
          updatedAt: 200,
        },
      ]),
    );
    localStorage.setItem('trex_active_environment', 'env-boot');

    await initializePersistence();

    const envs = await getPersistenceStorage().environments.getAll();
    expect(envs).toHaveLength(1);
    expect(envs[0]?.name).toBe('Env Boot');

    const activeId = await getPersistenceStorage().appState.get<string>('active_environment_id');
    expect(activeId).toBe('env-boot');

    expect(localStorage.getItem('trex_environments')).toBeNull();
  });
});

