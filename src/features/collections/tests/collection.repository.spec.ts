import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { CollectionRepository } from '../collection.repository';
import type { Collection } from '../interfaces';
import { DexiePersistenceStorage } from '../../../core/storage/indexeddb/dexie-persistence-storage';

describe('CollectionRepository', () => {
  let storage: DexiePersistenceStorage;
  let repository: CollectionRepository;

  beforeEach(async () => {
    localStorage.clear();
    storage = new DexiePersistenceStorage(`col-repo-test-${Date.now().toString()}-${Math.random().toString()}`);
    await storage.initialize();
    repository = new CollectionRepository(storage.collections);
  });

  it('should initialize with default collection when storage is empty', () => {
    const list = repository.getAll();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]?.id).toBe('col-default-trex');
  });

  it('should initialize from localStorage when available', () => {
    const customList = [{ id: 'col-ls', name: 'LS Collection', items: [] }];
    localStorage.setItem('trex_collections', JSON.stringify(customList));
    const repoLs = new CollectionRepository(storage.collections);
    expect(repoLs.getAll()).toHaveLength(1);
    expect(repoLs.getById('col-ls')?.name).toBe('LS Collection');
  });

  it('should fallback to default collections if localStorage has invalid JSON', () => {
    localStorage.setItem('trex_collections', '{invalid');
    const repoInvalid = new CollectionRepository(storage.collections);
    expect(repoInvalid.getAll()).toHaveLength(1);
  });

  it('should fallback to default collections if localStorage has empty array', () => {
    localStorage.setItem('trex_collections', JSON.stringify([]));
    const repoEmpty = new CollectionRepository(storage.collections);
    expect(repoEmpty.getAll()).toHaveLength(1);
  });

  it('should save and get collection by id', () => {
    const col: Collection = {
      id: 'col-nova',
      name: 'Nova Coleção',
      items: [],
    };
    repository.save(col);
    expect(repository.getById('col-nova')).toEqual(col);
    expect(repository.getAll()).toHaveLength(2);
  });

  it('should update existing collection on save', () => {
    const col: Collection = {
      id: 'col-default-trex',
      name: 'Nome Atualizado',
      items: [],
    };
    repository.save(col);
    expect(repository.getById('col-default-trex')?.name).toBe('Nome Atualizado');
  });

  it('should delete collection by id', () => {
    repository.delete('col-default-trex');
    expect(repository.getById('col-default-trex')).toBeNull();
  });

  it('should return null when collection does not exist', () => {
    expect(repository.getById('nao-existe')).toBeNull();
  });

  it('should load initial collections from persistent storage', async () => {
    const customCol: Collection = {
      id: 'col-custom',
      name: 'Carregada do DB',
      items: [],
    };
    await storage.collections.save(customCol);

    const reloadedRepo = new CollectionRepository(storage.collections);
    await reloadedRepo.load();
    expect(reloadedRepo.getById('col-custom')).not.toBeNull();
  });

  it('should bulkSave default collections to persistent storage when empty on load', async () => {
    const emptyStorage = new DexiePersistenceStorage(`empty-db-${Date.now().toString()}-${Math.random().toString()}`);
    await emptyStorage.initialize();

    const emptyRepo = new CollectionRepository(emptyStorage.collections);
    await emptyRepo.load();

    const fromStorage = await emptyStorage.collections.getAll();
    expect(fromStorage.length).toBeGreaterThan(0);

    await emptyStorage.clearAll();
    await emptyStorage.close();
  });
});

