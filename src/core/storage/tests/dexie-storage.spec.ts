import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DexiePersistenceStorage } from '../indexeddb/dexie-persistence-storage';
import type { Collection } from '../../../features/collections/interfaces';
import type { Environment } from '../../../features/environments/interfaces';
import type { ClientSettings } from '../../../features/settings/interfaces';
import type { RequestHistoryItem } from '../interfaces';

describe('DexiePersistenceStorage (IndexedDB)', () => {
  let storage: DexiePersistenceStorage;

  beforeEach(async () => {
    storage = new DexiePersistenceStorage(`test-db-${Date.now().toString()}-${Math.random().toString()}`);
    await storage.initialize();
  });

  afterEach(async () => {
    await storage.clearAll();
    await storage.close();
  });

  describe('Collections Repository', () => {
    it('should save, retrieve, and delete collections', async () => {
      const col: Collection = {
        id: 'col-dexie-1',
        name: 'Coleção Dexie',
        items: [
          {
            id: 'item-1',
            name: 'Req 1',
            type: 'request',
            method: 'GET',
            url: 'https://api.exemplo.com',
          },
        ],
      };

      await storage.collections.save(col);
      const retrieved = await storage.collections.getById('col-dexie-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Coleção Dexie');

      const all = await storage.collections.getAll();
      expect(all).toHaveLength(1);

      await storage.collections.delete('col-dexie-1');
      const afterDelete = await storage.collections.getById('col-dexie-1');
      expect(afterDelete).toBeNull();
    });

    it('should bulk save collections', async () => {
      const list: Collection[] = [
        { id: 'c1', name: 'Col 1', items: [] },
        { id: 'c2', name: 'Col 2', items: [] },
      ];
      await storage.collections.bulkSave(list);
      const all = await storage.collections.getAll();
      expect(all).toHaveLength(2);
    });

    it('should return null when collection does not exist', async () => {
      const notFound = await storage.collections.getById('non-existent');
      expect(notFound).toBeNull();
    });
  });

  describe('Environments Repository', () => {
    it('should save, retrieve, and delete environments', async () => {
      const env: Environment = {
        id: 'env-dexie-1',
        name: 'Dev Dexie',
        variables: [{ id: 'v1', key: 'URL', value: 'http://localhost', enabled: true }],
        createdAt: 100,
        updatedAt: 200,
      };

      await storage.environments.save(env);
      const retrieved = await storage.environments.getById('env-dexie-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Dev Dexie');

      const all = await storage.environments.getAll();
      expect(all).toHaveLength(1);

      await storage.environments.delete('env-dexie-1');
      const afterDelete = await storage.environments.getById('env-dexie-1');
      expect(afterDelete).toBeNull();
    });

    it('should bulk save environments', async () => {
      const list: Environment[] = [
        { id: 'e1', name: 'Env 1', variables: [], createdAt: 1, updatedAt: 2 },
        { id: 'e2', name: 'Env 2', variables: [], createdAt: 3, updatedAt: 4 },
      ];
      await storage.environments.bulkSave(list);
      const all = await storage.environments.getAll();
      expect(all).toHaveLength(2);
    });

    it('should return null when environment does not exist', async () => {
      const notFound = await storage.environments.getById('non-existent');
      expect(notFound).toBeNull();
    });
  });

  describe('Settings Repository', () => {
    it('should save and retrieve client settings', async () => {
      const settings: ClientSettings = {
        theme: 'triceratops-amber',
        orientation: 'vertical',
        density: 'compact',
        defaultTimeout: 15000,
        defaultRetryAttempts: 2,
        followRedirects: false,
        globalHeaders: { 'X-Trex': '1' },
        jsonTheme: {
          preset: 'triceratops-amber',
          backgroundColor: '#1c1813',
          keyColor: '#fbbf24',
          stringColor: '#f59e0b',
          numberColor: '#38bdf8',
          booleanColor: '#f87171',
          nullColor: '#a8a29e',
          bracketColor: '#fed7aa',
        },
        customThemes: [],
      };

      await storage.settings.saveSettings(settings);
      const saved = await storage.settings.getSettings();
      expect(saved).not.toBeNull();
      expect(saved?.theme).toBe('triceratops-amber');
      expect(saved?.orientation).toBe('vertical');
    });

    it('should return null when no settings are stored', async () => {
      const empty = await storage.settings.getSettings();
      expect(empty).toBeNull();
    });
  });

  describe('Request History Repository', () => {
    it('should add, list, delete, and clear history items with limits', async () => {
      const item1: RequestHistoryItem = {
        id: 'h1',
        url: 'https://api.com/1',
        method: 'GET',
        status: 200,
        timestamp: 100,
      };
      const item2: RequestHistoryItem = {
        id: 'h2',
        url: 'https://api.com/2',
        method: 'POST',
        status: 201,
        timestamp: 200,
      };

      await storage.history.add(item1);
      await storage.history.add(item2);

      const all = await storage.history.getAll();
      expect(all).toHaveLength(2);
      expect(all[0]?.id).toBe('h2');

      const limited = await storage.history.getAll(1);
      expect(limited).toHaveLength(1);
      expect(limited[0]?.id).toBe('h2');

      await storage.history.delete('h1');
      const afterDelete = await storage.history.getAll();
      expect(afterDelete).toHaveLength(1);

      await storage.history.clear();
      const empty = await storage.history.getAll();
      expect(empty).toHaveLength(0);
    });
  });

  describe('App State Repository', () => {
    it('should set, get, and remove key-value app state', async () => {
      await storage.appState.set('active_env_id', 'env-prod');
      const val = await storage.appState.get<string>('active_env_id');
      expect(val).toBe('env-prod');

      await storage.appState.remove('active_env_id');
      const afterRemove = await storage.appState.get<string>('active_env_id');
      expect(afterRemove).toBeNull();
    });

    it('should return null for non-existing key', async () => {
      const nonExisting = await storage.appState.get('missing');
      expect(nonExisting).toBeNull();
    });
  });
});

