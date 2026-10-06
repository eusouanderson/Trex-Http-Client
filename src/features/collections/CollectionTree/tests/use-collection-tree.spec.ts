import { describe, it, expect, beforeEach } from 'vitest';
import { useRequest } from '../../../request';
import { useCollectionTree } from '../use-collection-tree';

describe('useCollectionTree', () => {
  beforeEach(() => {
    const tree = useCollectionTree();
    tree.searchQuery.value = '';
    tree.cancelRename();
    tree.cancelRenameCollection();
  });

  it('should toggle collection expansion state', () => {
    const tree = useCollectionTree();
    const colId = 'col-default-trex';

    expect(tree.isExpanded(colId)).toBe(true);
    tree.toggleExpand(colId);
    expect(tree.isExpanded(colId)).toBe(false);
    tree.toggleExpand(colId);
    expect(tree.isExpanded(colId)).toBe(true);
  });

  it('should filter items by search query', () => {
    const tree = useCollectionTree();

    tree.searchQuery.value = 'Criar';
    const filtered = tree.filteredCollections.value;
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.some((c) =>
        c.items.some((i) => i.name.toLowerCase().includes('criar')),
      ),
    ).toBe(true);

    tree.searchQuery.value = 'T-Rex';
    expect(tree.filteredCollections.value.length).toBeGreaterThan(0);

    tree.searchQuery.value = 'nenhum-dinossauro-encontrado-xyz';
    expect(tree.filteredCollections.value).toEqual([]);
  });

  it('should handle prompt for new request in collection and fallback names', () => {
    const tree = useCollectionTree();
    const colId = 'col-default-trex';

    const newItem = tree.addNewRequest(colId, 'Novo Fóssil Teste');
    expect(newItem.name).toBe('Novo Fóssil Teste');
    expect(newItem.type).toBe('request');

    const defaultReq = tree.addNewRequest(colId);
    expect(defaultReq.name).toBe('Nova Requisição');

    tree.addNewCollection();
    expect(tree.filteredCollections.value.some((c) => c.name === 'Nova Coleção')).toBe(true);
  });

  it('should start renaming request item on double click trigger', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) {
      return;
    }
    const item = col.items[0];
    expect(item).toBeDefined();
    if (!item) {
      return;
    }

    tree.startRenaming(item);
    expect(tree.editingItemId.value).toBe(item.id);
    expect(tree.editingItemName.value).toBe(item.name);
  });

  it('should save renamed request item and clear editing state', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) {
      return;
    }
    const item = col.items[0];
    expect(item).toBeDefined();
    if (!item) {
      return;
    }

    tree.startRenaming(item);
    tree.editingItemName.value = 'Triceratops Endpoint';
    tree.saveRename(col.id, item.id);

    expect(tree.editingItemId.value).toBeNull();
    const updatedCol = tree.filteredCollections.value.find((c) => c.id === col.id);
    const updatedItem = updatedCol?.items.find((i) => i.id === item.id);
    expect(updatedItem?.name).toBe('Triceratops Endpoint');
  });

  it('should cancel renaming and leave item name unchanged', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) {
      return;
    }
    const item = col.items[0];
    expect(item).toBeDefined();
    if (!item) {
      return;
    }

    const originalName = item.name;
    tree.startRenaming(item);
    tree.editingItemName.value = 'Should Not Save';
    tree.cancelRename();

    expect(tree.editingItemId.value).toBeNull();
    const targetCol = tree.filteredCollections.value.find((c) => c.id === col.id);
    const targetItem = targetCol?.items.find((i) => i.id === item.id);
    expect(targetItem?.name).toBe(originalName);
  });

  it('should close open tabs when deleting an entire collection', () => {
    const tree = useCollectionTree();
    const { tabs, openTab } = useRequest();

    tree.addNewCollection('Coleção Temporária');
    const tempCol = tree.filteredCollections.value.find(
      (c) => c.name === 'Coleção Temporária',
    );
    expect(tempCol).toBeDefined();
    if (!tempCol) {
      return;
    }

    const item1 = tree.addNewRequest(tempCol.id, 'Req Temp 1');
    const item2 = tree.addNewRequest(tempCol.id, 'Req Temp 2');

    openTab({
      id: item1.id,
      name: item1.name,
      method: 'GET',
      url: item1.url ?? '',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    });

    openTab({
      id: item2.id,
      name: item2.name,
      method: 'GET',
      url: item2.url ?? '',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    });

    expect(tabs.value.some((t) => t.id === item1.id)).toBe(true);
    expect(tabs.value.some((t) => t.id === item2.id)).toBe(true);

    tree.deleteCol(tempCol.id);

    expect(tabs.value.some((t) => t.id === item1.id)).toBe(false);
    expect(tabs.value.some((t) => t.id === item2.id)).toBe(false);
  });

  it('should close open tab when deleting an individual request item', () => {
    const tree = useCollectionTree();
    const { tabs, openTab } = useRequest();

    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) {
      return;
    }

    const item = tree.addNewRequest(col.id, 'Item Para Deletar');

    openTab({
      id: item.id,
      name: item.name,
      method: 'GET',
      url: item.url ?? '',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    });

    expect(tabs.value.some((t) => t.id === item.id)).toBe(true);

    tree.deleteItm(col.id, item.id);

    expect(tabs.value.some((t) => t.id === item.id)).toBe(false);
  });

  it('should start renaming collection on double click trigger', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) {
      return;
    }

    tree.startRenamingCollection(col);
    expect(tree.editingCollectionId.value).toBe(col.id);
    expect(tree.editingCollectionName.value).toBe(col.name);
  });

  it('should save renamed collection and clear editing state', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) {
      return;
    }

    tree.startRenamingCollection(col);
    tree.editingCollectionName.value = 'Nova Coleção Renomeada';
    tree.saveRenameCollection(col.id);

    expect(tree.editingCollectionId.value).toBeNull();
    const target = tree.filteredCollections.value.find((c) => c.id === col.id);
    expect(target?.name).toBe('Nova Coleção Renomeada');
  });

  it('should cancel renaming collection and leave name unchanged', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) {
      return;
    }

    const originalName = col.name;
    tree.startRenamingCollection(col);
    tree.editingCollectionName.value = 'Ignorado';
    tree.cancelRenameCollection();

    expect(tree.editingCollectionId.value).toBeNull();
    const target = tree.filteredCollections.value.find((c) => c.id === col.id);
    expect(target?.name).toBe(originalName);
  });

  it('should auto-expand parent collection when item is selected', () => {
    const tree = useCollectionTree();
    tree.addNewCollection('Coleção Retraída');
    const targetCol = tree.filteredCollections.value.find(
      (c) => c.name === 'Coleção Retraída',
    );
    expect(targetCol).toBeDefined();
    if (!targetCol) {
      return;
    }

    const item = tree.addNewRequest(targetCol.id, 'Req Filha');
    tree.toggleExpand(targetCol.id);
    expect(tree.isExpanded(targetCol.id)).toBe(false);

    tree.select(item);
    expect(tree.isExpanded(targetCol.id)).toBe(true);
  });

  it('should ignore saveRename when editingItemId does not match or name is blank', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) return;
    const item = col.items[0];
    expect(item).toBeDefined();
    if (!item) return;

    tree.startRenaming(item);
    tree.saveRename(col.id, 'outro-id-diferente');
    expect(tree.editingItemId.value).toBe(item.id);

    tree.editingItemName.value = '   ';
    tree.saveRename(col.id, item.id);
    expect(tree.editingItemId.value).toBeNull();
  });

  it('should ignore saveRenameCollection when editingCollectionId does not match or name is blank', () => {
    const tree = useCollectionTree();
    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) return;

    tree.startRenamingCollection(col);
    tree.saveRenameCollection('outro-col-id');
    expect(tree.editingCollectionId.value).toBe(col.id);

    tree.editingCollectionName.value = '   ';
    tree.saveRenameCollection(col.id);
    expect(tree.editingCollectionId.value).toBeNull();
  });

  it('should invoke onSelectItem callback when provided', () => {
    let selectedPayload: unknown = null;
    const tree = useCollectionTree((item) => {
      selectedPayload = item;
    });

    const col = tree.filteredCollections.value[0];
    expect(col).toBeDefined();
    if (!col) return;
    const item = col.items[0];
    expect(item).toBeDefined();
    if (!item) return;

    tree.select(item);
    expect(selectedPayload).toEqual(item);
  });
});
