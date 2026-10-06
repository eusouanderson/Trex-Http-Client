import type { Collection } from '../../../features/collections/interfaces';
import type { ICollectionRepository } from '../interfaces';
import type { TrexDexieDatabase } from './dexie-database';
import { validateCollection } from '../schemas';

class DexieCollectionRepository implements ICollectionRepository {
  constructor(private readonly db: TrexDexieDatabase) {}

  public readonly getAll = async (): Promise<Collection[]> => {
    const list = await this.db.collections.toArray();
    return list.map((item) => validateCollection(item));
  };

  public readonly getById = async (id: string): Promise<Collection | null> => {
    const found = await this.db.collections.get(id);
    return found ? validateCollection(found) : null;
  };

  public readonly save = async (collection: Collection): Promise<Collection> => {
    const validated = validateCollection(collection);
    await this.db.collections.put(validated);
    return validated;
  };

  public readonly delete = async (id: string): Promise<void> => {
    await this.db.collections.delete(id);
  };

  public readonly bulkSave = async (collections: Collection[]): Promise<void> => {
    const validated = collections.map((col) => validateCollection(col));
    await this.db.collections.bulkPut(validated);
  };
}

export { DexieCollectionRepository };

