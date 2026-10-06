import { ref } from 'vue';
import type {
  Collection,
  CollectionItem,
  CreateItemInput,
} from './interfaces';
import { CollectionService } from './collection.service';
import { CollectionRepository } from './collection.repository';

const collectionRepository = new CollectionRepository();
const collectionService = new CollectionService(undefined, collectionRepository);
void collectionRepository.load().then(() => {
  collectionsState.value = collectionService.getCollections();
});
const initialCollections = collectionService.getCollections();
const collectionsState = ref<Collection[]>(initialCollections);
const selectedItemIdState = ref<string | null>('req-dino-1');

interface UseCollectionsReturn {
  collections: typeof collectionsState;
  selectedItemId: typeof selectedItemIdState;
  createCollection: (name: string, description?: string) => Collection;
  updateCollection: (id: string, patch: Partial<Collection>) => Collection;
  deleteCollection: (id: string) => void;
  addItem: (collectionId: string, input: CreateItemInput) => CollectionItem;
  updateItem: (
    collectionId: string,
    itemId: string,
    patch: Partial<CollectionItem>,
  ) => CollectionItem;
  updateItemById: (
    itemId: string,
    patch: Partial<CollectionItem>,
  ) => CollectionItem | null;
  deleteItem: (collectionId: string, itemId: string) => void;
  reorderItems: (collectionId: string, items: CollectionItem[]) => void;
  selectItem: (itemId: string | null) => void;
}

const useCollections = (): UseCollectionsReturn => {
  const syncState = (): void => {
    collectionsState.value = collectionService.getCollections();
  };

  const createCollection = (name: string, description?: string): Collection => {
    const created = collectionService.createCollection(name, description);
    syncState();
    return created;
  };

  const updateCollection = (
    id: string,
    patch: Partial<Collection>,
  ): Collection => {
    const updated = collectionService.updateCollection(id, patch);
    syncState();
    return updated;
  };

  const deleteCollection = (id: string): void => {
    collectionService.deleteCollection(id);
    syncState();
  };

  const addItem = (
    collectionId: string,
    input: CreateItemInput,
  ): CollectionItem => {
    const item = collectionService.addItem(collectionId, input);
    syncState();
    return item;
  };

  const updateItem = (
    collectionId: string,
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem => {
    const item = collectionService.updateItem(collectionId, itemId, patch);
    syncState();
    return item;
  };

  const updateItemById = (
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem | null => {
    const item = collectionService.updateItemById(itemId, patch);
    if (item) {
      syncState();
    }
    return item;
  };

  const deleteItem = (collectionId: string, itemId: string): void => {
    collectionService.deleteItem(collectionId, itemId);
    if (selectedItemIdState.value === itemId) {
      selectedItemIdState.value = null;
    }
    syncState();
  };

  const reorderItems = (
    collectionId: string,
    items: CollectionItem[],
  ): void => {
    collectionService.reorderItems(collectionId, items);
    syncState();
  };

  const selectItem = (itemId: string | null): void => {
    selectedItemIdState.value = itemId;
  };

  return {
    collections: collectionsState,
    selectedItemId: selectedItemIdState,
    createCollection,
    updateCollection,
    deleteCollection,
    addItem,
    updateItem,
    updateItemById,
    deleteItem,
    reorderItems,
    selectItem,
  };
};

export { useCollections };
