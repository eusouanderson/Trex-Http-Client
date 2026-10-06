import type { Environment, IEnvironmentRepository } from './interfaces';
import type { IEnvironmentRepository as IPersistentEnvironmentRepository } from '../../core/storage/interfaces';
import { getPersistenceStorage } from '../../core/storage/storage.factory';

class EnvironmentRepository implements IEnvironmentRepository {
  private readonly STORAGE_KEY = 'trex_environments';
  private readonly persistentRepo: IPersistentEnvironmentRepository;
  private cache: Environment[] = [];

  constructor(persistentRepo?: IPersistentEnvironmentRepository) {
    this.persistentRepo = persistentRepo ?? getPersistenceStorage().environments;
    this.cache = this.readStorage();
  }

  private readStorage(): Environment[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw === null || raw.length === 0) return [];
    try {
      return JSON.parse(raw) as Environment[];
    } catch {
      return [];
    }
  }

  private writeStorage(data: Environment[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  public readonly load = async (): Promise<void> => {
    const stored = await this.persistentRepo.getAll();
    if (stored.length > 0) {
      this.cache = [...stored];
      this.writeStorage(this.cache);
    } else if (this.cache.length > 0) {
      await this.persistentRepo.bulkSave(this.cache);
    }
  };

  public getAll(): Environment[] {
    return [...this.cache];
  }

  public getById(id: string): Environment | null {
    const all = this.getAll();
    return all.find((e) => e.id === id) ?? null;
  }

  public save(environment: Environment): void {
    const all = [...this.cache];
    const index = all.findIndex((e) => e.id === environment.id);

    if (index >= 0) {
      all[index] = environment;
    } else {
      all.push(environment);
    }

    this.cache = all;
    this.writeStorage(all);
    void this.persistentRepo.save(environment);
  }

  public delete(id: string): void {
    const all = [...this.cache];
    const filtered = all.filter((e) => e.id !== id);
    this.cache = filtered;
    this.writeStorage(filtered);
    void this.persistentRepo.delete(id);
  }
}

export { EnvironmentRepository };
