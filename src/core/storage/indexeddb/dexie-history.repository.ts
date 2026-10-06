import type { RequestHistoryItem, IRequestHistoryRepository } from '../interfaces';
import type { TrexDexieDatabase } from './dexie-database';
import { validateRequestHistoryItem } from '../schemas';

class DexieHistoryRepository implements IRequestHistoryRepository {
  constructor(private readonly db: TrexDexieDatabase) {}

  public readonly getAll = async (limit = 100): Promise<RequestHistoryItem[]> => {
    const list = await this.db.history
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
    return list.map((item) => validateRequestHistoryItem(item));
  };

  public readonly add = async (item: RequestHistoryItem): Promise<RequestHistoryItem> => {
    const validated = validateRequestHistoryItem(item);
    await this.db.history.put(validated);
    return validated;
  };

  public readonly delete = async (id: string): Promise<void> => {
    await this.db.history.delete(id);
  };

  public readonly clear = async (): Promise<void> => {
    await this.db.history.clear();
  };
}

export { DexieHistoryRepository };

