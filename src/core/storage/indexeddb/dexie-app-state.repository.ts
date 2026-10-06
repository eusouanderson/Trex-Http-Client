import type { IAppStateRepository, AppStateRecord } from '../interfaces';
import type { TrexDexieDatabase } from './dexie-database';

class DexieAppStateRepository implements IAppStateRepository {
  constructor(private readonly db: TrexDexieDatabase) {}

  public readonly get = async <T>(key: string): Promise<T | null> => {
    const record = await this.db.appState.get(key);
    if (!record) return null;
    return record.value as T;
  };

  public readonly set = async (key: string, value: unknown): Promise<void> => {
    const record: AppStateRecord = {
      key,
      value,
      updatedAt: Date.now(),
    };
    await this.db.appState.put(record);
  };

  public readonly remove = async (key: string): Promise<void> => {
    await this.db.appState.delete(key);
  };
}

export { DexieAppStateRepository };

