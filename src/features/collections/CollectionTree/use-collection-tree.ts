import type { ComputedRef, Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import { useRequest } from '../../request';
import type { Collection, CollectionItem } from '../interfaces';
import { useCollections } from '../use-collections';
import { useEnvironments } from '../../environments/use-environments';
import type { ContextMenuItem } from '../../../shared/ui/ContextMenu';

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
  importCollection: (jsonString: string) => void;
  importPostmanCollection: (jsonString: string) => void;
  isDraggableDisabled: ComputedRef<boolean>;
  handleReorderCollections: (newCollections: Collection[]) => void;
  handleReorderItems: (colId: string, newItems: CollectionItem[]) => void;
  isContextMenuOpen: Ref<boolean>;
  contextMenuPos: Ref<{ x: number; y: number }>;
  contextMenuCollection: Ref<Collection | null>;
  contextMenuItems: ComputedRef<ContextMenuItem[]>;
  openCollectionContextMenu: (event: MouseEvent, collection: Collection) => void;
  closeContextMenu: () => void;
  isRunnerModalOpen: Ref<boolean>;
  runnerModalCollection: Ref<Collection | null>;
  openRunnerModal: (collection: Collection) => void;
  closeRunnerModal: () => void;
  duplicateCol: (collectionId: string) => void;
  clearStatusesCol: (collectionId: string) => void;
  exportCol: (collectionId: string) => void;
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
    reorderItems,
    reorderCollections,
    duplicateCollection,
    clearCollectionStatuses,
    exportCollection,
    importCollection: importCollectionDomain,
    selectItem,
  } = useCollections();
  const { createEnvironment, updateEnvironment } = useEnvironments();
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
      url: 'https://eusouanderson.github.io/Trex-Http-Client/get',
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

  const importCollection = (jsonString: string): void => {
    try {
      const { collection, variables } = importCollectionDomain(jsonString);

      if (variables.length > 0) {
        const env = createEnvironment(collection.name);
        env.variables = variables.map((v) => ({
          id: crypto.randomUUID(),
          key: v.key,
          value: v.value,
          enabled: v.enabled,
        }));
        updateEnvironment(env);
      }

      const updated = new Set(expandedSet.value);
      updated.add(collection.id);
      expandedSet.value = updated;
    } catch {
      window.alert(
        'Erro ao importar collection. Certifique-se de que o arquivo é uma collection válida do Trex ou do Postman.',
      );
    }
  };

  const importPostmanCollection = (jsonString: string): void => {
    importCollection(jsonString);
  };

  const isDraggableDisabled = computed<boolean>(() => {
    return searchQueryState.value.trim().length > 0;
  });

  const handleReorderCollections = (newCollections: Collection[]): void => {
    reorderCollections(newCollections);
  };

  const handleReorderItems = (colId: string, newItems: CollectionItem[]): void => {
    reorderItems(colId, newItems);
  };

  const isContextMenuOpen = ref<boolean>(false);
  const contextMenuPos = ref<{ x: number; y: number }>({ x: 0, y: 0 });
  const contextMenuCollection = ref<Collection | null>(null);

  const isRunnerModalOpen = ref<boolean>(false);
  const runnerModalCollection = ref<Collection | null>(null);

  const openCollectionContextMenu = (
    event: MouseEvent,
    collection: Collection,
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    contextMenuPos.value = { x: event.clientX, y: event.clientY };
    contextMenuCollection.value = collection;
    isContextMenuOpen.value = true;
  };

  const closeContextMenu = (): void => {
    isContextMenuOpen.value = false;
    contextMenuCollection.value = null;
  };

  const openRunnerModal = (collection: Collection): void => {
    runnerModalCollection.value = collection;
    isRunnerModalOpen.value = true;
  };

  const closeRunnerModal = (): void => {
    isRunnerModalOpen.value = false;
    runnerModalCollection.value = null;
  };

  const duplicateCol = (collectionId: string): void => {
    const duplicated = duplicateCollection(collectionId);
    const updated = new Set(expandedSet.value);
    updated.add(duplicated.id);
    expandedSet.value = updated;
  };

  const clearStatusesCol = (collectionId: string): void => {
    clearCollectionStatuses(collectionId);
  };

  const exportCol = (collectionId: string): void => {
    try {
      const col = collections.value.find((c) => c.id === collectionId);
      if (!col) {
        return;
      }
      const json = exportCollection(collectionId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = col.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${baseName}.trex_collection.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      return;
    }
  };

  const contextMenuItems = computed<ContextMenuItem[]>(() => {
    const col = contextMenuCollection.value;
    if (!col) {
      return [];
    }

    return [
      {
        id: 'run-collection',
        label: 'Executar Coleção',
        icon: '🚀',
        action: () => {
          openRunnerModal(col);
        },
      },
      {
        id: 'add-request',
        label: 'Nova Requisição',
        icon: '➕',
        action: () => {
          addNewRequest(col.id);
        },
      },
      {
        id: 'duplicate-collection',
        label: 'Duplicar Coleção',
        icon: '📋',
        action: () => {
          duplicateCol(col.id);
        },
      },
      {
        id: 'rename-collection',
        label: 'Renomear',
        icon: '✏️',
        action: () => {
          startRenamingCollection(col);
        },
      },
      {
        id: 'export-collection',
        label: 'Exportar Coleção',
        icon: '📥',
        action: () => {
          exportCol(col.id);
        },
      },
      {
        id: 'clear-statuses',
        label: 'Limpar Status',
        icon: '🧹',
        divider: true,
        action: () => {
          clearStatusesCol(col.id);
        },
      },
      {
        id: 'delete-collection',
        label: 'Excluir Coleção',
        icon: '🗑️',
        danger: true,
        divider: true,
        action: () => {
          deleteCol(col.id);
        },
      },
    ];
  });

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
    importCollection,
    importPostmanCollection,
    isDraggableDisabled,
    handleReorderCollections,
    handleReorderItems,
    isContextMenuOpen,
    contextMenuPos,
    contextMenuCollection,
    contextMenuItems,
    openCollectionContextMenu,
    closeContextMenu,
    isRunnerModalOpen,
    runnerModalCollection,
    openRunnerModal,
    closeRunnerModal,
    duplicateCol,
    clearStatusesCol,
    exportCol,
  };
};

export { useCollectionTree };

