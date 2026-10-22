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

interface GenericCollectionProbe {
  info?: {
    name?: string;
    schema?: string;
  };
  schema?: string;
  name?: string;
  item?: unknown;
  items?: unknown;
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


interface PostmanHeader {
  key?: string;
  value?: string;
  disabled?: boolean;
}

interface PostmanUrl {
  raw?: string;
  query?: { key?: string; value?: string; disabled?: boolean }[];
  variable?: { key?: string; value?: string }[];
}

interface PostmanUrlEncoded {
  key?: string;
  value?: string;
  disabled?: boolean;
}

interface PostmanBody {
  mode?: string;
  raw?: string;
  urlencoded?: PostmanUrlEncoded[];
}

interface PostmanRequest {
  method?: string;
  url?: string | PostmanUrl;
  header?: PostmanHeader[];
  body?: PostmanBody;
}

interface PostmanItem {
  name?: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
}

interface PostmanInfo {
  name?: string;
}

interface PostmanVariable {
  key?: string;
  value?: string;
  disabled?: boolean;
}

interface PostmanCollection {
  info?: PostmanInfo;
  item?: PostmanItem[];
  variable?: PostmanVariable[];
}


interface TrexInfo {
  name?: string;
  description?: string;
  schema?: string;
}

interface RawTrexItem {
  id?: string;
  name?: string;
  type?: string;
  parentId?: string | null;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
  auth?: AuthConfig;
  testScript?: string;
  status?: number;
}

interface RawTrexCollection {
  info?: TrexInfo;
  id?: string;
  name?: string;
  description?: string;
  auth?: AuthConfig;
  items?: RawTrexItem[];
}


export type {
  Collection, CollectionItem, CollectionItemType, CollectionRunItemResult, CollectionRunItemTestResult, CollectionRunReport, CreateItemInput, GenericCollectionProbe, ICollectionParserService, ICollectionRunnerService, ICollectionService,
  ILocalCollectionRepository, ParsedCollectionItem, ParsedCollectionResult, ParsedCollectionVariable, PostmanBody, PostmanCollection, PostmanHeader, PostmanInfo, PostmanItem, PostmanRequest, PostmanUrl, PostmanUrlEncoded, PostmanVariable, RawTrexCollection, RawTrexItem, TrexInfo
};

