import Dexie, { type EntityTable } from 'dexie';
import type { Collection } from '../../../features/collections/interfaces';
import type { Environment } from '../../../features/environments/interfaces';
import type { ClientSettings } from '../../../features/settings/interfaces';
import type { RequestHistoryItem, AppStateRecord } from '../interfaces';

interface SettingsRecord {
  id: string;
  data: ClientSettings;
  updatedAt: number;
}

class TrexDexieDatabase extends Dexie {
  public collections!: EntityTable<Collection, 'id'>;
  public environments!: EntityTable<Environment, 'id'>;
  public settings!: EntityTable<SettingsRecord, 'id'>;
  public history!: EntityTable<RequestHistoryItem, 'id'>;
  public appState!: EntityTable<AppStateRecord, 'key'>;

  constructor(databaseName = 'trex_http_client_db') {
    super(databaseName);

    this.version(1).stores({
      collections: 'id, name',
      environments: 'id, name, updatedAt',
      settings: 'id, updatedAt',
      history: 'id, timestamp, method, status',
      appState: 'key, updatedAt',
    });
  }
}

export { TrexDexieDatabase, type SettingsRecord };

