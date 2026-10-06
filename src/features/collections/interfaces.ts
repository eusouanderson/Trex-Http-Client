import type { HttpMethod } from '../../core/http/interfaces';

type CollectionItemType = 'request' | 'folder';

interface CollectionItem {
  id: string;
  name: string;
  type: CollectionItemType;
  parentId?: string | null;
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
  status?: number;
  children?: CollectionItem[];
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
}

interface CreateItemInput {
  name: string;
  type: CollectionItemType;
  parentId?: string | null;
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
  status?: number;
}

interface ICollectionService {
  getCollections(): Collection[];
  createCollection(name: string, description?: string): Collection;
  updateCollection(id: string, patch: Partial<Collection>): Collection;
  deleteCollection(id: string): void;
  addItem(collectionId: string, input: CreateItemInput): CollectionItem;
  updateItem(
    collectionId: string,
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem;
  updateItemById(
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem | null;
  deleteItem(collectionId: string, itemId: string): void;
  reorderItems(collectionId: string, items: CollectionItem[]): void;
}

interface ILocalCollectionRepository {
  getAll(): Collection[];
  getById(id: string): Collection | null;
  save(collection: Collection): void;
  delete(id: string): void;
  load(): Promise<void>;
}

export type {
  CollectionItemType,
  CollectionItem,
  Collection,
  CreateItemInput,
  ICollectionService,
  ILocalCollectionRepository,
};
