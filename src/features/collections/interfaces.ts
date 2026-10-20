import type { HttpMethod } from '../../core/http/interfaces';

import type { AuthConfig } from '../../core/security/interfaces';

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
  auth?: AuthConfig;
  testScript?: string;
  status?: number;
  children?: CollectionItem[];
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  auth?: AuthConfig;
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
  auth?: AuthConfig;
  testScript?: string;
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
  reorderCollections(collections: Collection[]): void;
  duplicateCollection(collectionId: string): Collection;
  clearCollectionStatuses(collectionId: string): void;
  exportCollection(collectionId: string): string;
  importCollection(jsonString: string): {
    collection: Collection;
    variables: ParsedCollectionVariable[];
  };
}

interface ILocalCollectionRepository {
  getAll(): Collection[];
  getById(id: string): Collection | null;
  save(collection: Collection): void;
  delete(id: string): void;
  reorder(collections: Collection[]): void;
  load(): Promise<void>;
}

interface CollectionRunItemTestResult {
  name: string;
  passed: boolean;
  error?: string;
}

interface CollectionRunItemResult {
  itemId: string;
  name: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  durationMs: number;
  sizeBytes?: number;
  error?: string;
  tests: CollectionRunItemTestResult[];
}

interface CollectionRunReport {
  collectionId: string;
  collectionName: string;
  total: number;
  passed: number;
  failed: number;
  totalDurationMs: number;
  items: CollectionRunItemResult[];
}

interface ICollectionRunnerService {
  run(
    collection: Collection,
    onProgress?: (result: CollectionRunItemResult, index: number, total: number) => void,
    signal?: AbortSignal,
  ): Promise<CollectionRunReport>;
}

interface ParsedCollectionItem {
  id?: string;
  name: string;
  type: CollectionItemType;
  parentId?: string | null;
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
  auth?: AuthConfig;
  testScript?: string;
  status?: number;
}

interface ParsedCollectionVariable {
  key: string;
  value: string;
  enabled: boolean;
}

interface ParsedCollectionResult {
  name: string;
  description?: string;
  auth?: AuthConfig;
  items: ParsedCollectionItem[];
  variables: ParsedCollectionVariable[];
  format: 'trex' | 'postman';
}

interface ICollectionParserService {
  parse(jsonString: string): ParsedCollectionResult;
}

export type {
  CollectionItemType,
  CollectionItem,
  Collection,
  CreateItemInput,
  ICollectionService,
  ILocalCollectionRepository,
  CollectionRunItemTestResult,
  CollectionRunItemResult,
  CollectionRunReport,
  ICollectionRunnerService,
  ParsedCollectionItem,
  ParsedCollectionVariable,
  ParsedCollectionResult,
  ICollectionParserService,
};
