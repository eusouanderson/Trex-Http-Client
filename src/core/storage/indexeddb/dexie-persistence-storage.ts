import type {
  IPersistenceStorage,
  ICollectionRepository,
  IEnvironmentRepository,
  ISettingsRepository,
  IRequestHistoryRepository,
  IAppStateRepository,
} from '../interfaces';
import { TrexDexieDatabase } from './dexie-database';
import { DexieCollectionRepository } from './dexie-collection.repository';
import { DexieEnvironmentRepository } from './dexie-environment.repository';
import { DexieSettingsRepository } from './dexie-settings.repository';
import { DexieHistoryRepository } from './dexie-history.repository';
import { DexieAppStateRepository } from './dexie-app-state.repository';

class DexiePersistenceStorage implements IPersistenceStorage {
  private readonly db: TrexDexieDatabase;
  public readonly collections: ICollectionRepository;
  public readonly environments: IEnvironmentRepository;
  public readonly settings: ISettingsRepository;
  public readonly history: IRequestHistoryRepository;
  public readonly appState: IAppStateRepository;

  constructor(databaseName = 'trex_http_client_db') {
    this.db = new TrexDexieDatabase(databaseName);
    this.collections = new DexieCollectionRepository(this.db);
    this.environments = new DexieEnvironmentRepository(this.db);
    this.settings = new DexieSettingsRepository(this.db);
    this.history = new DexieHistoryRepository(this.db);
    this.appState = new DexieAppStateRepository(this.db);
  }

  public readonly initialize = async (): Promise<void> => {
    if (!this.db.isOpen()) {
      await this.db.open();
    }
  };

  public readonly close = (): Promise<void> => {
    if (this.db.isOpen()) {
      this.db.close();
    }
    return Promise.resolve();
  };

  public readonly clearAll = async (): Promise<void> => {
    await this.db.transaction('rw', [
      this.db.collections,
      this.db.environments,
      this.db.settings,
      this.db.history,
      this.db.appState,
    ], async () => {
      await Promise.all([
        this.db.collections.clear(),
        this.db.environments.clear(),
        this.db.settings.clear(),
        this.db.history.clear(),
        this.db.appState.clear(),
      ]);
    });
  };
}

export { DexiePersistenceStorage };

