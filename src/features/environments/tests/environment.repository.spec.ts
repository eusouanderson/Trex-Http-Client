import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentRepository } from '../environment.repository';
import type { Environment } from '../interfaces';

describe('EnvironmentRepository', () => {
  let repository: EnvironmentRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new EnvironmentRepository();
  });

  it('should return empty array when localStorage is empty', () => {
    expect(repository.getAll()).toEqual([]);
  });

  it('should return empty array when localStorage contains corrupted JSON', () => {
    localStorage.setItem('trex_environments', '{not-json');
    const corruptedRepo = new EnvironmentRepository();
    expect(corruptedRepo.getAll()).toEqual([]);
  });

  it('should not bulkSave when both persistent storage and cache are empty on load', async () => {
    let bulkSaved = false;
    const mockStorage = {
      getAll: () => Promise.resolve([]),
      getById: () => Promise.resolve(null),
      save: () => Promise.resolve({ id: '', name: '', variables: [], createdAt: 0, updatedAt: 0 }),
      delete: () => Promise.resolve(),
      bulkSave: () => {
        bulkSaved = true;
        return Promise.resolve();
      },
    };
    const emptyRepo = new EnvironmentRepository(mockStorage);
    await emptyRepo.load();
    expect(bulkSaved).toBe(false);
  });

  it('should save and retrieve environments', () => {
    const env: Environment = {
      id: 'env-1',
      name: 'Staging',
      variables: [],
      createdAt: 100,
      updatedAt: 100,
    };

    repository.save(env);
    expect(repository.getAll()).toHaveLength(1);
    expect(repository.getById('env-1')).toEqual(env);
    expect(repository.getById('missing')).toBeNull();
  });

  it('should update environment when already existing', () => {
    const env: Environment = {
      id: 'env-1',
      name: 'Old Name',
      variables: [],
      createdAt: 100,
      updatedAt: 100,
    };
    repository.save(env);

    const updatedEnv: Environment = {
      ...env,
      name: 'New Name',
    };
    repository.save(updatedEnv);

    expect(repository.getAll()).toHaveLength(1);
    expect(repository.getById('env-1')?.name).toBe('New Name');
  });

  it('should delete environment by id', () => {
    const env: Environment = {
      id: 'env-1',
      name: 'To Delete',
      variables: [],
      createdAt: 100,
      updatedAt: 100,
    };
    repository.save(env);
    expect(repository.getAll()).toHaveLength(1);

    repository.delete('env-1');
    expect(repository.getAll()).toHaveLength(0);
  });

  it('should load environments from persistent storage when present', async () => {
    const custom: Environment = {
      id: 'env-custom',
      name: 'Custom Db Env',
      variables: [],
      createdAt: 1,
      updatedAt: 2,
    };
    const mockStorage = {
      getAll: () => Promise.resolve([custom]),
      getById: () => Promise.resolve(custom),
      save: () => Promise.resolve(custom),
      delete: () => Promise.resolve(),
      bulkSave: () => Promise.resolve(),
    };

    const customRepo = new EnvironmentRepository(mockStorage);
    await customRepo.load();
    expect(customRepo.getById('env-custom')?.name).toBe('Custom Db Env');
  });

  it('should bulkSave cache to persistent storage on load when persistent storage is empty and cache has items', async () => {
    let bulkSaved = false;
    const mockStorage = {
      getAll: () => Promise.resolve([]),
      getById: () => Promise.resolve(null),
      save: () => Promise.resolve({ id: '', name: '', variables: [], createdAt: 0, updatedAt: 0 }),
      delete: () => Promise.resolve(),
      bulkSave: () => {
        bulkSaved = true;
        return Promise.resolve();
      },
    };

    localStorage.setItem(
      'trex_environments',
      JSON.stringify([
        {
          id: 'env-cache',
          name: 'Cache Env',
          variables: [],
          createdAt: 1,
          updatedAt: 2,
        },
      ]),
    );

    const customRepo = new EnvironmentRepository(mockStorage);
    await customRepo.load();
    expect(bulkSaved).toBe(true);
  });
});

