import { describe, it, expect, beforeEach } from 'vitest';
import { useCollections } from '../use-collections';

describe('useCollections', () => {
  beforeEach(() => {
    const { collections, deleteCollection } = useCollections();
    [...collections.value].forEach((c) => {
      deleteCollection(c.id);
    });
  });

  it('should manage collections lifecycle reactively', () => {
    const { collections, createCollection, updateCollection, deleteCollection } = useCollections();
    const col = createCollection('Fossils', 'Dino fossils');
    expect(collections.value).toHaveLength(1);
    expect(col.name).toBe('Fossils');

    const updated = updateCollection(col.id, { name: 'Jurassic Fossils' });
    expect(updated.name).toBe('Jurassic Fossils');
    expect(collections.value[0]?.name).toBe('Jurassic Fossils');

    deleteCollection(col.id);
    expect(collections.value).toHaveLength(0);
  });

  it('should manage items within collection reactively', () => {
    const {
      collections,
      createCollection,
      addItem,
      updateItem,
      updateItemById,
      deleteItem,
      reorderItems,
      selectItem,
      selectedItemId,
    } = useCollections();

    const col = createCollection('API');
    const item1 = addItem(col.id, { name: 'Item 1', type: 'request' });
    const item2 = addItem(col.id, { name: 'Item 2', type: 'request' });

    expect(collections.value[0]?.items).toHaveLength(2);

    updateItem(col.id, item1.id, { name: 'Updated Item 1' });
    expect(collections.value[0]?.items[0]?.name).toBe('Updated Item 1');

    const updatedById = updateItemById(item2.id, { name: 'Updated Item 2' });
    expect(updatedById?.name).toBe('Updated Item 2');

    const missingItem = updateItemById('not-found', { name: 'None' });
    expect(missingItem).toBeNull();

    reorderItems(col.id, [item2, item1]);
    expect(collections.value[0]?.items[0]?.id).toBe(item2.id);

    selectItem(item2.id);
    expect(selectedItemId.value).toBe(item2.id);

    deleteItem(col.id, item2.id);
    expect(selectedItemId.value).toBeNull();
  });
});

