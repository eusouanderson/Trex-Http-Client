import type { ComputedRef } from 'vue';
import { computed, ref, watch } from 'vue';
import { useRequest } from '../../request';
import type { Collection, CollectionItem } from '../interfaces';
import { useCollections } from '../use-collections';

const expandedSet = ref<Set<string>>(new Set(['col-default-trex']));
const searchQueryState = ref<string>('');
const editingItemIdState = ref<string | null>(null);
const editingItemNameState = ref<string>('');
const editingCollectionIdState = ref<string | null>(null);
const editingCollectionNameState = ref<string>('');

interface UseCollectionTreeReturn {
  searchQuery: typeof searchQueryState;
  collections: ReturnType<typeof useCollections>['collections'];
  selectedItemId: ReturnType<typeof useCollections>['selectedItemId'];
  editingItemId: typeof editingItemIdState;
  editingItemName: typeof editingItemNameState;
  editingCollectionId: typeof editingCollectionIdState;
  editingCollectionName: typeof editingCollectionNameState;
  filteredCollections: ComputedRef<Collection[]>;
  isExpanded: (colId: string) => boolean;
  toggleExpand: (colId: string) => void;
  addNewRequest: (colId: string, name?: string) => CollectionItem;
  addNewCollection: (name?: string) => void;
  deleteCol: (colId: string) => void;
  deleteItm: (colId: string, itemId: string) => void;
  select: (item: CollectionItem) => void;
  startRenaming: (item: CollectionItem) => void;
  saveRename: (colId: string, itemId: string) => void;
  cancelRename: () => void;
  startRenamingCollection: (collection: Collection) => void;
  saveRenameCollection: (collectionId: string) => void;
  cancelRenameCollection: () => void;
}

const useCollectionTree = (
  onSelectItem?: (item: CollectionItem) => void,
): UseCollectionTreeReturn => {
  const {
    collections,
    selectedItemId,
    addItem,
    updateItem,
    createCollection,
    updateCollection,
    deleteCollection,
    deleteItem,
    selectItem,
  } = useCollections();
  const { renameTab, closeTab } = useRequest();

  watch(
    selectedItemId,
    (newId) => {
      if (newId === null || newId.length === 0) {
        return;
      }
      const parentCol = collections.value.find((c) =>
        c.items.some((i) => i.id === newId),
      );
      if (parentCol) {
        const nextSet = new Set(expandedSet.value);
        nextSet.add(parentCol.id);
        expandedSet.value = nextSet;
      }
    },
    { immediate: true, flush: 'sync' },
  );

  const isExpanded = (colId: string): boolean => {
    return expandedSet.value.has(colId);
  };

  const toggleExpand = (colId: string): void => {
    const updated = new Set(expandedSet.value);
    if (updated.has(colId)) {
      updated.delete(colId);
    } else {
      updated.add(colId);
    }
    expandedSet.value = updated;
  };

  const filteredCollections = computed<Collection[]>(() => {
    const query = searchQueryState.value.trim().toLowerCase();
    if (query.length === 0) {
      return collections.value;
    }

    return collections.value
      .map((col) => {
        const matchesCol = col.name.toLowerCase().includes(query);
        const matchingItems = col.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.url?.toLowerCase().includes(query) === true,
        );

        if (matchesCol) {
          return col;
        }

        if (matchingItems.length > 0) {
          return {
            ...col,
            items: matchingItems,
          };
        }

        return null;
      })
      .filter((c): c is Collection => c !== null);
  });

  const addNewRequest = (
    colId: string,
    name?: string,
  ): CollectionItem => {
    const item = addItem(colId, {
      name: name ?? 'Nova Requisição',
      type: 'request',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
    });
    const updated = new Set(expandedSet.value);
    updated.add(colId);
    expandedSet.value = updated;
    select(item);
    return item;
  };

  const addNewCollection = (name?: string): void => {
    const col = createCollection(name ?? 'Nova Coleção');
    const updated = new Set(expandedSet.value);
    updated.add(col.id);
    expandedSet.value = updated;
  };

  const deleteCol = (colId: string): void => {
    const target = collections.value.find((c) => c.id === colId);
    if (target) {
      target.items.forEach((item) => {
        closeTab(item.id);
      });
    }
    deleteCollection(colId);
  };

  const deleteItm = (colId: string, itemId: string): void => {
    closeTab(itemId);
    deleteItem(colId, itemId);
  };

  const select = (item: CollectionItem): void => {
    selectItem(item.id);
    const parentCol = collections.value.find((c) =>
      c.items.some((i) => i.id === item.id),
    );
    if (parentCol) {
      const nextSet = new Set(expandedSet.value);
      nextSet.add(parentCol.id);
      expandedSet.value = nextSet;
    }
    if (onSelectItem !== undefined) {
      onSelectItem(item);
    }
  };

  const startRenaming = (item: CollectionItem): void => {
    editingItemIdState.value = item.id;
    editingItemNameState.value = item.name;
  };

  const saveRename = (colId: string, itemId: string): void => {
    if (editingItemIdState.value !== itemId) {
      return;
    }
    const trimmed = editingItemNameState.value.trim();
    if (trimmed.length > 0) {
      updateItem(colId, itemId, { name: trimmed });
      renameTab(itemId, trimmed);
    }
    editingItemIdState.value = null;
    editingItemNameState.value = '';
  };

  const cancelRename = (): void => {
    editingItemIdState.value = null;
    editingItemNameState.value = '';
  };

  const startRenamingCollection = (collection: Collection): void => {
    editingCollectionIdState.value = collection.id;
    editingCollectionNameState.value = collection.name;
  };

  const saveRenameCollection = (collectionId: string): void => {
    if (editingCollectionIdState.value !== collectionId) {
      return;
    }
    const trimmed = editingCollectionNameState.value.trim();
    if (trimmed.length > 0) {
      updateCollection(collectionId, { name: trimmed });
    }
    editingCollectionIdState.value = null;
    editingCollectionNameState.value = '';
  };

  const cancelRenameCollection = (): void => {
    editingCollectionIdState.value = null;
    editingCollectionNameState.value = '';
  };

  return {
    searchQuery: searchQueryState,
    collections,
    selectedItemId,
    editingItemId: editingItemIdState,
    editingItemName: editingItemNameState,
    editingCollectionId: editingCollectionIdState,
    editingCollectionName: editingCollectionNameState,
    filteredCollections,
    isExpanded,
    toggleExpand,
    addNewRequest,
    addNewCollection,
    deleteCol,
    deleteItm,
    select,
    startRenaming,
    saveRename,
    cancelRename,
    startRenamingCollection,
    saveRenameCollection,
    cancelRenameCollection,
  };
};

export { useCollectionTree };
