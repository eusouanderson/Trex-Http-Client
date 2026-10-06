import type {
  IPersistenceStorage,
  ICollectionRepository,
  IEnvironmentRepository,
  ISettingsRepository,
  IRequestHistoryRepository,
  IAppStateRepository,
  RequestHistoryItem,
} from '../interfaces';
import type { Collection } from '../../../features/collections/interfaces';
import type { Environment } from '../../../features/environments/interfaces';
import type { ClientSettings } from '../../../features/settings/interfaces';
import {
  validateCollection,
  validateEnvironment,
  validateClientSettings,
  validateRequestHistoryItem,
} from '../schemas';

class SqliteCollectionRepository implements ICollectionRepository {
  private readonly records = new Map<string, Collection>();

  public readonly getAll = (): Promise<Collection[]> => {
    return Promise.resolve(
      Array.from(this.records.values()).map((c) => validateCollection(c)),
    );
  };

  public readonly getById = (id: string): Promise<Collection | null> => {
    const found = this.records.get(id);
    return Promise.resolve(found ? validateCollection(found) : null);
  };

  public readonly save = (collection: Collection): Promise<Collection> => {
    const validated = validateCollection(collection);
    this.records.set(validated.id, validated);
    return Promise.resolve(validated);
  };

  public readonly delete = (id: string): Promise<void> => {
    this.records.delete(id);
    return Promise.resolve();
  };

  public readonly bulkSave = (collections: Collection[]): Promise<void> => {
    for (const c of collections) {
      const validated = validateCollection(c);
      this.records.set(validated.id, validated);
    }
    return Promise.resolve();
  };

  public readonly clear = (): void => {
    this.records.clear();
  };
}

class SqliteEnvironmentRepository implements IEnvironmentRepository {
  private readonly records = new Map<string, Environment>();

  public readonly getAll = (): Promise<Environment[]> => {
    return Promise.resolve(
      Array.from(this.records.values()).map((e) => validateEnvironment(e)),
    );
  };

  public readonly getById = (id: string): Promise<Environment | null> => {
    const found = this.records.get(id);
    return Promise.resolve(found ? validateEnvironment(found) : null);
  };

  public readonly save = (environment: Environment): Promise<Environment> => {
    const validated = validateEnvironment(environment);
    this.records.set(validated.id, validated);
    return Promise.resolve(validated);
  };

  public readonly delete = (id: string): Promise<void> => {
    this.records.delete(id);
    return Promise.resolve();
  };

  public readonly bulkSave = (environments: Environment[]): Promise<void> => {
    for (const e of environments) {
      const validated = validateEnvironment(e);
      this.records.set(validated.id, validated);
    }
    return Promise.resolve();
  };

  public readonly clear = (): void => {
    this.records.clear();
  };
}

class SqliteSettingsRepository implements ISettingsRepository {
  private settings: ClientSettings | null = null;

  public readonly getSettings = (): Promise<ClientSettings | null> => {
    return Promise.resolve(
      this.settings ? validateClientSettings(this.settings) : null,
    );
  };

  public readonly saveSettings = (
    settings: ClientSettings,
  ): Promise<ClientSettings> => {
    const validated = validateClientSettings(settings);
    this.settings = validated;
    return Promise.resolve(validated);
  };

  public readonly clear = (): void => {
    this.settings = null;
  };
}

class SqliteHistoryRepository implements IRequestHistoryRepository {
  private readonly records: RequestHistoryItem[] = [];

  public readonly getAll = (limit = 100): Promise<RequestHistoryItem[]> => {
    const items = this.records
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map((h) => validateRequestHistoryItem(h));
    return Promise.resolve(items);
  };

  public readonly add = (
    item: RequestHistoryItem,
  ): Promise<RequestHistoryItem> => {
    const validated = validateRequestHistoryItem(item);
    this.records.push(validated);
    return Promise.resolve(validated);
  };

  public readonly delete = (id: string): Promise<void> => {
    const index = this.records.findIndex((r) => r.id === id);
    if (index >= 0) {
      this.records.splice(index, 1);
    }
    return Promise.resolve();
  };

  public readonly clear = (): Promise<void> => {
    this.records.length = 0;
    return Promise.resolve();
  };
}

class SqliteAppStateRepository implements IAppStateRepository {
  private readonly state = new Map<string, unknown>();

  public readonly get = <T>(key: string): Promise<T | null> => {
    const val = this.state.get(key);
    return Promise.resolve(val !== undefined ? (val as T) : null);
  };

  public readonly set = (key: string, value: unknown): Promise<void> => {
    this.state.set(key, value);
    return Promise.resolve();
  };

  public readonly remove = (key: string): Promise<void> => {
    this.state.delete(key);
    return Promise.resolve();
  };

  public readonly clear = (): void => {
    this.state.clear();
  };
}

class SqlitePersistenceStorage implements IPersistenceStorage {
  public readonly collections: SqliteCollectionRepository;
  public readonly environments: SqliteEnvironmentRepository;
  public readonly settings: SqliteSettingsRepository;
  public readonly history: SqliteHistoryRepository;
  public readonly appState: SqliteAppStateRepository;

  constructor() {
    this.collections = new SqliteCollectionRepository();
    this.environments = new SqliteEnvironmentRepository();
    this.settings = new SqliteSettingsRepository();
    this.history = new SqliteHistoryRepository();
    this.appState = new SqliteAppStateRepository();
  }

  public readonly initialize = (): Promise<void> => {
    return Promise.resolve();
  };

  public readonly close = (): Promise<void> => {
    return Promise.resolve();
  };

  public readonly clearAll = async (): Promise<void> => {
    this.collections.clear();
    this.environments.clear();
    this.settings.clear();
    await this.history.clear();
    this.appState.clear();
  };
}

export {
  SqlitePersistenceStorage,
  SqliteCollectionRepository,
  SqliteEnvironmentRepository,
  SqliteSettingsRepository,
  SqliteHistoryRepository,
  SqliteAppStateRepository,
};
