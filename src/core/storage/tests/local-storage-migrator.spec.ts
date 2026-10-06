import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageMigrator } from '../migrations/local-storage-migrator';
import { DexiePersistenceStorage } from '../indexeddb/dexie-persistence-storage';
import type { Environment } from '../../../features/environments/interfaces';

describe('LocalStorageMigrator', () => {
  let storage: DexiePersistenceStorage;
  let migrator: LocalStorageMigrator;

  beforeEach(async () => {
    localStorage.clear();
    storage = new DexiePersistenceStorage(`migrator-test-${Date.now().toString()}-${Math.random().toString()}`);
    await storage.initialize();
    migrator = new LocalStorageMigrator(storage);
  });

  afterEach(async () => {
    localStorage.clear();
    await storage.clearAll();
    await storage.close();
  });

  it('should migrate valid environments and active environment id from localStorage to indexeddb', async () => {
    const legacyEnvs: Environment[] = [
      {
        id: 'legacy-env-1',
        name: 'Ambiente Antigo',
        variables: [{ id: 'v1', key: 'URL', value: 'https://api.com', enabled: true }],
        createdAt: 1000,
        updatedAt: 2000,
      },
    ];

    localStorage.setItem('trex_environments', JSON.stringify(legacyEnvs));
    localStorage.setItem('trex_active_environment', 'legacy-env-1');

    const result = await migrator.migrate();
    expect(result.migratedEnvironmentsCount).toBe(1);
    expect(result.migratedActiveEnvironment).toBe(true);

    const savedInDb = await storage.environments.getAll();
    expect(savedInDb).toHaveLength(1);
    expect(savedInDb[0]?.name).toBe('Ambiente Antigo');

    const activeInDb = await storage.appState.get<string>('active_environment_id');
    expect(activeInDb).toBe('legacy-env-1');

    expect(localStorage.getItem('trex_environments')).toBeNull();
    expect(localStorage.getItem('trex_active_environment')).toBeNull();
  });

  it('should do nothing when localStorage is empty', async () => {
    const result = await migrator.migrate();
    expect(result.migratedEnvironmentsCount).toBe(0);
    expect(result.migratedActiveEnvironment).toBe(false);

    const envs = await storage.environments.getAll();
    expect(envs).toHaveLength(0);
  });

  it('should ignore and remove corrupted JSON in localStorage without throwing', async () => {
    localStorage.setItem('trex_environments', '{corrupted-json');
    localStorage.setItem('trex_active_environment', 'some-id');

    const result = await migrator.migrate();
    expect(result.migratedEnvironmentsCount).toBe(0);
    expect(result.migratedActiveEnvironment).toBe(true);

    const activeInDb = await storage.appState.get<string>('active_environment_id');
    expect(activeInDb).toBe('some-id');
    expect(localStorage.getItem('trex_environments')).toBeNull();
  });

  it('should not overwrite existing environments in indexeddb if database already has records', async () => {
    const existing: Environment = {
      id: 'existing-env',
      name: 'Já Existe no DB',
      variables: [],
      createdAt: 1,
      updatedAt: 2,
    };
    await storage.environments.save(existing);

    const legacyEnvs: Environment[] = [
      {
        id: 'legacy-ignored',
        name: 'Legado Ignorado',
        variables: [],
        createdAt: 1,
        updatedAt: 2,
      },
    ];
    localStorage.setItem('trex_environments', JSON.stringify(legacyEnvs));

    const result = await migrator.migrate();
    expect(result.migratedEnvironmentsCount).toBe(0);

    const envsInDb = await storage.environments.getAll();
    expect(envsInDb).toHaveLength(1);
    expect(envsInDb[0]?.id).toBe('existing-env');
  });

  it('should filter out invalid items from legacy environments array', async () => {
    const mixed = [
      { id: 'valid', name: 'Valido', variables: [], createdAt: 1, updatedAt: 2 },
      { id: 123, invalid: true },
    ];
    localStorage.setItem('trex_environments', JSON.stringify(mixed));

    const result = await migrator.migrate();
    expect(result.migratedEnvironmentsCount).toBe(1);

    const envs = await storage.environments.getAll();
    expect(envs).toHaveLength(1);
    expect(envs[0]?.id).toBe('valid');
  });
});

