import { describe, it, expect, beforeEach } from 'vitest';
import { CollectionService } from '../collection.service';

describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(() => {
    service = new CollectionService();
  });

  it('should initialize with default collection and allow creating new ones', () => {
    const collections = service.getCollections();
    expect(collections.length).toBeGreaterThanOrEqual(1);

    const created = service.createCollection('API do Parque Cretáceo', 'Endpoints do laboratório');
    expect(created.id).toBeDefined();
    expect(created.name).toBe('API do Parque Cretáceo');
    expect(created.description).toBe('Endpoints do laboratório');
    expect(created.items).toEqual([]);

    const updatedList = service.getCollections();
    expect(updatedList.some((c) => c.id === created.id)).toBe(true);
  });

  it('should delete collection by id', () => {
    const created = service.createCollection('Coleção Temporária');
    expect(service.getCollections().some((c) => c.id === created.id)).toBe(true);

    service.deleteCollection(created.id);
    expect(service.getCollections().some((c) => c.id === created.id)).toBe(false);
  });

  it('should update collection details such as name and description', () => {
    const col = service.createCollection('Coleção Original');
    const updated = service.updateCollection(col.id, {
      name: 'Coleção Renomeada',
      description: 'Nova Descrição',
    });

    expect(updated.name).toBe('Coleção Renomeada');
    expect(updated.description).toBe('Nova Descrição');

    const foundCol = service.getCollections().find((c) => c.id === col.id);
    expect(foundCol?.name).toBe('Coleção Renomeada');
  });

  it('should add requests and folders to a collection', () => {
    const col = service.createCollection('Coleção Teste');

    const folder = service.addItem(col.id, {
      name: 'Fósseis',
      type: 'folder',
    });
    expect(folder.id).toBeDefined();
    expect(folder.name).toBe('Fósseis');
    expect(folder.type).toBe('folder');

    const requestItem = service.addItem(col.id, {
      name: 'Obter T-Rex',
      type: 'request',
      method: 'GET',
      url: 'https://api.dino.dev/trex',
      parentId: folder.id,
    });
    expect(requestItem.method).toBe('GET');
    expect(requestItem.parentId).toBe(folder.id);

    const foundCol = service.getCollections().find((c) => c.id === col.id);
    expect(foundCol?.items.length).toBe(2);
  });

  it('should update and delete items within a collection', () => {
    const col = service.createCollection('Coleção Edição');
    const item = service.addItem(col.id, {
      name: 'Request Inicial',
      type: 'request',
      method: 'GET',
      url: 'https://api.dino.dev/init',
    });

    const updated = service.updateItem(col.id, item.id, {
      name: 'Request Atualizada',
      method: 'POST',
      body: '{"status":"ativo"}',
    });
    expect(updated.name).toBe('Request Atualizada');
    expect(updated.method).toBe('POST');
    expect(updated.body).toBe('{"status":"ativo"}');

    service.deleteItem(col.id, item.id);
    const foundCol = service.getCollections().find((c) => c.id === col.id);
    expect(foundCol?.items.some((i) => i.id === item.id)).toBe(false);
  });

  it('should reorder items in collection', () => {
    const col = service.createCollection('Coleção Reordenação');
    const itemA = service.addItem(col.id, { name: 'Item A', type: 'request' });
    const itemB = service.addItem(col.id, { name: 'Item B', type: 'request' });

    service.reorderItems(col.id, [itemB, itemA]);

    const foundCol = service.getCollections().find((c) => c.id === col.id);
    expect(foundCol?.items[0]?.id).toBe(itemB.id);
    expect(foundCol?.items[1]?.id).toBe(itemA.id);
  });

  it('should update item by id directly across all collections', () => {
    const col = service.createCollection('Coleção Direta');
    const item = service.addItem(col.id, {
      name: 'Req Original',
      type: 'request',
      method: 'GET',
    });

    const updated = service.updateItemById(item.id, {
      method: 'POST',
      status: 201,
    });

    expect(updated).not.toBeNull();
    expect(updated?.method).toBe('POST');
    expect(updated?.status).toBe(201);
  });

  it('should delegate getCollections to repository when provided', () => {
    let saved = false;
    let deleted = false;
    const mockRepo = {
      load: () => Promise.resolve(),
      getAll: () => [{ id: 'col-mock', name: 'Mock Col', items: [] }],
      getById: () => null,
      save: () => {
        saved = true;
      },
      delete: () => {
        deleted = true;
      },
    };
    const serviceWithRepo = new CollectionService(undefined, mockRepo);
    expect(serviceWithRepo.getCollections()).toHaveLength(1);
    expect(serviceWithRepo.getCollections()[0]?.id).toBe('col-mock');
    expect(saved).toBe(false);
    expect(deleted).toBe(false);
  });
});
