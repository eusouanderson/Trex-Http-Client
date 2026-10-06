import type { Environment } from '../../../features/environments/interfaces';
import type { IEnvironmentRepository } from '../interfaces';
import type { TrexDexieDatabase } from './dexie-database';
import { validateEnvironment } from '../schemas';

class DexieEnvironmentRepository implements IEnvironmentRepository {
  constructor(private readonly db: TrexDexieDatabase) {}

  public readonly getAll = async (): Promise<Environment[]> => {
    const list = await this.db.environments.toArray();
    return list.map((item) => validateEnvironment(item));
  };

  public readonly getById = async (id: string): Promise<Environment | null> => {
    const found = await this.db.environments.get(id);
    return found ? validateEnvironment(found) : null;
  };

  public readonly save = async (environment: Environment): Promise<Environment> => {
    const validated = validateEnvironment(environment);
    await this.db.environments.put(validated);
    return validated;
  };

  public readonly delete = async (id: string): Promise<void> => {
    await this.db.environments.delete(id);
  };

  public readonly bulkSave = async (environments: Environment[]): Promise<void> => {
    const validated = environments.map((env) => validateEnvironment(env));
    await this.db.environments.bulkPut(validated);
  };
}

export { DexieEnvironmentRepository };

