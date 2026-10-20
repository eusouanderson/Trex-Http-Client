import { describe, it, expect } from 'vitest';
import { CollectionEntity } from '../collection.entity';

describe('CollectionEntity', () => {
  it('should initialize with default collection when no initial given', () => {
    const entity = new CollectionEntity();
    expect(entity.all.length).toBe(1);
    expect(entity.all[0]?.name).toBe('🦖 Coleção T-Rex');
  });

  it('should accept custom initial collections', () => {
    const entity = new CollectionEntity([
      { id: 'custom-1', name: 'Custom Collection', items: [] },
    ]);
    expect(entity.all.length).toBe(1);
    expect(entity.all[0]?.id).toBe('custom-1');
  });

  it('should create and delete collections', () => {
    const entity = new CollectionEntity([]);
    const created = entity.create('New Col', 'Description');
    expect(entity.all).toHaveLength(1);
    expect(created.name).toBe('New Col');
    expect(created.description).toBe('Description');

    entity.delete(created.id);
    expect(entity.all).toHaveLength(0);
  });

  it('should update collection or throw if not found', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('Initial');

    const updated = entity.update(col.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    expect(entity.all[0]?.name).toBe('Updated');

    expect(() => entity.update('non-existent', { name: 'Fail' })).toThrow(
      'Collection not found: non-existent',
    );
  });

  it('should add item and throw if collection not found', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('My Col');

    const item = entity.addItem(col.id, {
      name: 'Get Users',
      type: 'request',
      method: 'GET',
      url: 'https://api.dinossauro.dev/users',
    });
    expect(item.name).toBe('Get Users');
    expect(entity.all[0]?.items).toHaveLength(1);

    expect(() =>
      entity.addItem('unknown-id', {
        name: 'Item',
        type: 'request',
      }),
    ).toThrow('Collection not found: unknown-id');
  });

  it('should update item and throw if collection or item not found', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('Col');
    const item = entity.addItem(col.id, {
      name: 'Old',
      type: 'request',
    });

    const updated = entity.updateItem(col.id, item.id, { name: 'New' });
    expect(updated.name).toBe('New');

    expect(() =>
      entity.updateItem('invalid-col', item.id, { name: 'X' }),
    ).toThrow('Collection not found: invalid-col');

    expect(() =>
      entity.updateItem(col.id, 'invalid-item', { name: 'X' }),
    ).toThrow('Item not found: invalid-item');
  });

  it('should update item by id across any collection or return null', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('Col');
    const item = entity.addItem(col.id, {
      name: 'Direct Item',
      type: 'request',
    });

    const updated = entity.updateItemById(item.id, { url: 'https://new.url' });
    expect(updated?.url).toBe('https://new.url');

    const missing = entity.updateItemById('missing-item', { name: 'None' });
    expect(missing).toBeNull();
  });

  it('should delete item and handle non-existent collection safely', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('Col');
    const item = entity.addItem(col.id, { name: 'To Delete', type: 'request' });

    entity.deleteItem(col.id, item.id);
    expect(entity.all[0]?.items).toHaveLength(0);

    entity.deleteItem('missing-col', item.id);
  });

  it('should reorder items and handle non-existent collection safely', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('Col');
    const item1 = entity.addItem(col.id, { name: 'Item 1', type: 'request' });
    const item2 = entity.addItem(col.id, { name: 'Item 2', type: 'request' });

    entity.reorderItems(col.id, [item2, item1]);
    expect(entity.all[0]?.items[0]?.id).toBe(item2.id);

    entity.reorderItems('missing-col', []);
  });

  it('should reorder collections array', () => {
    const entity = new CollectionEntity([]);
    const colA = entity.create('Collection A');
    const colB = entity.create('Collection B');
    expect(entity.all[0]?.id).toBe(colA.id);
    expect(entity.all[1]?.id).toBe(colB.id);

    entity.reorder([colB, colA]);
    expect(entity.all[0]?.id).toBe(colB.id);
    expect(entity.all[1]?.id).toBe(colA.id);
  });

  it('should duplicate collection with new ids and name suffixed', () => {
    const entity = new CollectionEntity([]);
    const original = entity.create('Auth API', 'Desc');
    entity.update(original.id, { auth: { type: 'bearer', token: 'secret', enabled: true } });
    const item = entity.addItem(original.id, {
      name: 'Login',
      type: 'request',
      method: 'POST',
      url: 'https://api.dino.dev/login',
      headers: { 'X-Dino': 'true' },
      params: { limit: '10' },
      auth: { type: 'basic', username: 'u', password: 'p', enabled: true },
    });
    entity.addItem(original.id, {
      name: 'Simple Request',
      type: 'request',
    });

    const duplicated = entity.duplicate(original.id);
    expect(duplicated.id).not.toBe(original.id);
    expect(duplicated.name).toBe('Auth API (Cópia)');
    expect(duplicated.description).toBe('Desc');
    expect(duplicated.auth).toEqual({ type: 'bearer', token: 'secret', enabled: true });
    expect(duplicated.items).toHaveLength(2);
    expect(duplicated.items[0]?.id).not.toBe(item.id);
    expect(duplicated.items[0]?.name).toBe('Login');
    expect(duplicated.items[0]?.headers).toEqual({ 'X-Dino': 'true' });
    expect(duplicated.items[0]?.params).toEqual({ limit: '10' });
    expect(duplicated.items[0]?.auth).toEqual({ type: 'basic', username: 'u', password: 'p', enabled: true });
    expect(duplicated.items[1]?.headers).toBeUndefined();
    expect(duplicated.items[1]?.params).toBeUndefined();
    expect(duplicated.items[1]?.auth).toBeUndefined();
    expect(entity.all).toHaveLength(2);

    const noAuthCol = entity.create('Sem Auth');
    const dupNoAuth = entity.duplicate(noAuthCol.id);
    expect(dupNoAuth.auth).toBeUndefined();
  });

  it('should throw error when duplicating non-existent collection', () => {
    const entity = new CollectionEntity([]);
    expect(() => entity.duplicate('not-found')).toThrow('Collection not found: not-found');
  });

  it('should clear statuses on items of collection', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('Status Test');
    const item = entity.addItem(col.id, {
      name: 'Item',
      type: 'request',
      status: 200,
    });
    expect(item.status).toBe(200);

    entity.clearStatuses(col.id);
    expect(entity.all[0]?.items[0]?.status).toBeUndefined();

    entity.clearStatuses('missing-col');
  });

  it('should export collection as JSON string with info schema', () => {
    const entity = new CollectionEntity([]);
    const col = entity.create('Export Test', 'Desc');
    const json = entity.export(col.id);
    const parsed = JSON.parse(json) as {
      name: string;
      id: string;
      info?: { name: string; schema: string };
    };
    expect(parsed.name).toBe('Export Test');
    expect(parsed.id).toBe(col.id);
    expect(parsed.info?.schema).toBe(
      'https://trex-http-client.dev/schemas/collection/v1.0.0/collection.json',
    );
    expect(parsed.info?.name).toBe('Export Test');
  });

  it('should import parsed collection and remap item IDs and parentIds', () => {
    const entity = new CollectionEntity([]);
    const imported = entity.import({
      format: 'trex',
      name: 'Imported Trex',
      description: 'Desc',
      auth: { type: 'bearer', token: 'tok', enabled: true },
      variables: [],
      items: [
        {
          id: 'old-folder-id',
          name: 'Pasta Pai',
          type: 'folder',
        },
        {
          id: 'old-child-id',
          name: 'Req Filho',
          type: 'request',
          parentId: 'old-folder-id',
          method: 'GET',
          url: 'https://api.dev/child',
          headers: { 'X-Key': 'Val' },
          params: { p: '1' },
          body: 'body-data',
          auth: { type: 'bearer', token: 'item-tok', enabled: true },
          testScript: 'tx.test("ok", () => {});',
        },
        {
          name: 'Req Raiz',
          type: 'request',
          parentId: null,
          method: 'POST',
          url: 'https://api.dev/root',
        },
      ],
    });

    expect(imported.name).toBe('Imported Trex');
    expect(imported.description).toBe('Desc');
    expect(imported.auth?.type).toBe('bearer');
    expect(imported.items).toHaveLength(3);

    const folder = imported.items[0];
    const child = imported.items[1];
    const root = imported.items[2];

    expect(folder?.id).not.toBe('old-folder-id');
    expect(child?.id).not.toBe('old-child-id');
    expect(child?.parentId).toBe(folder?.id);
    expect(root?.parentId).toBeNull();
    expect(entity.all).toHaveLength(1);
    expect(entity.all[0]?.id).toBe(imported.id);
  });

  it('should throw error when exporting non-existent collection', () => {
    const entity = new CollectionEntity([]);
    expect(() => entity.export('not-found')).toThrow('Collection not found: not-found');
  });
});


