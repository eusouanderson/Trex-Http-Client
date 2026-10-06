import type { Collection } from '../../features/collections/interfaces';
import type { Environment } from '../../features/environments/interfaces';
import type { ClientSettings } from '../../features/settings/interfaces';
import type { HttpMethod } from '../http/interfaces';

interface RequestHistoryItem {
  id: string;
  url: string;
  method: HttpMethod;
  status?: number;
  durationMs?: number;
  timestamp: number;
  headers?: Record<string, string>;
  body?: string;
}

interface AppStateRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

interface ICollectionRepository {
  getAll(): Promise<Collection[]>;
  getById(id: string): Promise<Collection | null>;
  save(collection: Collection): Promise<Collection>;
  delete(id: string): Promise<void>;
  bulkSave(collections: Collection[]): Promise<void>;
}

interface IEnvironmentRepository {
  getAll(): Promise<Environment[]>;
  getById(id: string): Promise<Environment | null>;
  save(environment: Environment): Promise<Environment>;
  delete(id: string): Promise<void>;
  bulkSave(environments: Environment[]): Promise<void>;
}

interface ISettingsRepository {
  getSettings(): Promise<ClientSettings | null>;
  saveSettings(settings: ClientSettings): Promise<ClientSettings>;
}

interface IRequestHistoryRepository {
  getAll(limit?: number): Promise<RequestHistoryItem[]>;
  add(item: RequestHistoryItem): Promise<RequestHistoryItem>;
  clear(): Promise<void>;
  delete(id: string): Promise<void>;
}

interface IAppStateRepository {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

interface IPersistenceStorage {
  collections: ICollectionRepository;
  environments: IEnvironmentRepository;
  settings: ISettingsRepository;
  history: IRequestHistoryRepository;
  appState: IAppStateRepository;
  initialize(): Promise<void>;
  close(): Promise<void>;
  clearAll(): Promise<void>;
}

type PersistenceTarget = 'indexeddb' | 'sqlite';

export type {
  RequestHistoryItem,
  AppStateRecord,
  ICollectionRepository,
  IEnvironmentRepository,
  ISettingsRepository,
  IRequestHistoryRepository,
  IAppStateRepository,
  IPersistenceStorage,
  PersistenceTarget,
};

