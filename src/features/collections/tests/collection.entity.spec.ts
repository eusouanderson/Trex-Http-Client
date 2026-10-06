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
});

