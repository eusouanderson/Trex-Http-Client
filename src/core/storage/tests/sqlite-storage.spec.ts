import { describe, it, expect, beforeEach } from 'vitest';
import { SqlitePersistenceStorage } from '../sqlite/sqlite-persistence-storage';
import type { Collection } from '../../../features/collections/interfaces';
import type { Environment } from '../../../features/environments/interfaces';
import type { ClientSettings } from '../../../features/settings/interfaces';
import type { RequestHistoryItem } from '../interfaces';

describe('SqlitePersistenceStorage', () => {
  let storage: SqlitePersistenceStorage;

  beforeEach(() => {
    storage = new SqlitePersistenceStorage();
  });

  describe('Collections', () => {
    it('should save, getById, getAll, bulkSave, delete, and clear collections', async () => {
      const col1: Collection = { id: 'c1', name: 'Col 1', items: [] };
      const col2: Collection = { id: 'c2', name: 'Col 2', items: [] };

      await storage.collections.save(col1);
      expect(await storage.collections.getById('c1')).toEqual(col1);
      expect(await storage.collections.getById('none')).toBeNull();

      await storage.collections.bulkSave([col2]);
      expect(await storage.collections.getAll()).toHaveLength(2);

      await storage.collections.delete('c1');
      expect(await storage.collections.getAll()).toHaveLength(1);

      storage.collections.clear();
      expect(await storage.collections.getAll()).toHaveLength(0);
    });
  });

  describe('Environments', () => {
    it('should save, getById, getAll, bulkSave, delete, and clear environments', async () => {
      const env1: Environment = {
        id: 'e1',
        name: 'Env 1',
        variables: [],
        createdAt: 1,
        updatedAt: 2,
      };
      const env2: Environment = {
        id: 'e2',
        name: 'Env 2',
        variables: [],
        createdAt: 3,
        updatedAt: 4,
      };

      await storage.environments.save(env1);
      expect(await storage.environments.getById('e1')).toEqual(env1);
      expect(await storage.environments.getById('none')).toBeNull();

      await storage.environments.bulkSave([env2]);
      expect(await storage.environments.getAll()).toHaveLength(2);

      await storage.environments.delete('e1');
      expect(await storage.environments.getAll()).toHaveLength(1);

      storage.environments.clear();
      expect(await storage.environments.getAll()).toHaveLength(0);
    });
  });

  describe('Settings', () => {
    it('should get, save, and clear settings', async () => {
      expect(await storage.settings.getSettings()).toBeNull();

      const settings: ClientSettings = {
        theme: 'dino',
        orientation: 'horizontal',
        density: 'comfortable',
        defaultTimeout: 30000,
        defaultRetryAttempts: 1,
        followRedirects: true,
        globalHeaders: {},
        jsonTheme: {
          preset: 'dino',
          backgroundColor: '#141311',
          keyColor: '#86efac',
          stringColor: '#fcd34d',
          numberColor: '#60a5fa',
          booleanColor: '#f87171',
          nullColor: '#938d82',
          bracketColor: '#cdbca4',
        },
      };

      await storage.settings.saveSettings(settings);
      expect(await storage.settings.getSettings()).toEqual(settings);

      storage.settings.clear();
      expect(await storage.settings.getSettings()).toBeNull();
    });
  });

  describe('History', () => {
    it('should add, getAll sorted by timestamp, delete, and clear history', async () => {
      const h1: RequestHistoryItem = {
        id: 'h1',
        url: 'http://api.com/1',
        method: 'GET',
        timestamp: 10,
      };
      const h2: RequestHistoryItem = {
        id: 'h2',
        url: 'http://api.com/2',
        method: 'POST',
        timestamp: 20,
      };

      await storage.history.add(h1);
      await storage.history.add(h2);

      const all = await storage.history.getAll(1);
      expect(all).toHaveLength(1);
      expect(all[0]?.id).toBe('h2');

      await storage.history.delete('h1');
      await storage.history.delete('none');
      expect(await storage.history.getAll()).toHaveLength(1);

      await storage.history.clear();
      expect(await storage.history.getAll()).toHaveLength(0);
    });
  });

  describe('AppState', () => {
    it('should set, get, remove, and clear app state', async () => {
      expect(await storage.appState.get('missing')).toBeNull();

      await storage.appState.set('key1', 'val1');
      expect(await storage.appState.get('key1')).toBe('val1');

      await storage.appState.remove('key1');
      expect(await storage.appState.get('key1')).toBeNull();

      await storage.appState.set('key2', 'val2');
      storage.appState.clear();
      expect(await storage.appState.get('key2')).toBeNull();
    });
  });

  describe('Lifecycle & clearAll', () => {
    it('should clearAll across all repositories', async () => {
      await storage.collections.save({ id: 'c', name: 'C', items: [] });
      await storage.environments.save({ id: 'e', name: 'E', variables: [], createdAt: 1, updatedAt: 2 });
      await storage.history.add({ id: 'h', url: 'u', method: 'GET', timestamp: 1 });
      await storage.appState.set('k', 'v');

      await storage.clearAll();

      expect(await storage.collections.getAll()).toHaveLength(0);
      expect(await storage.environments.getAll()).toHaveLength(0);
      expect(await storage.history.getAll()).toHaveLength(0);
      expect(await storage.appState.get('k')).toBeNull();
    });
  });
});

