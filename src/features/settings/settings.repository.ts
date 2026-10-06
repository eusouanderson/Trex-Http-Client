import type { ClientSettings, ILocalSettingsRepository } from './interfaces';
import type { ISettingsRepository as IPersistentSettingsRepository } from '../../core/storage/interfaces';
import { getPersistenceStorage } from '../../core/storage/storage.factory';
import { SettingsEntity } from './settings.entity';

class SettingsRepository implements ILocalSettingsRepository {
  private readonly STORAGE_KEY = 'trex_settings';
  private readonly entity: SettingsEntity;
  private readonly persistentRepo: IPersistentSettingsRepository;

  constructor(persistentRepo?: IPersistentSettingsRepository) {
    this.persistentRepo = persistentRepo ?? getPersistenceStorage().settings;
    const cached = this.readStorage();
    this.entity = new SettingsEntity(cached ?? undefined);
  }

  private readStorage(): Partial<ClientSettings> | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw === null || raw.length === 0) return null;
      return JSON.parse(raw) as Partial<ClientSettings>;
    } catch {
      return null;
    }
  }

  private writeStorage(settings: ClientSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  public readonly load = async (): Promise<void> => {
    const hasLocal = this.readStorage() !== null;
    const stored = await this.persistentRepo.getSettings();
    if (stored) {
      if (!hasLocal) {
        this.entity.update(stored);
        this.writeStorage(this.entity.value);
      } else {
        await this.persistentRepo.saveSettings(this.entity.value);
      }
    } else {
      await this.persistentRepo.saveSettings(this.entity.value);
    }
  };

  public readonly getSettings = (): ClientSettings => {
    return this.entity.value;
  };

  public readonly save = (settings: ClientSettings): void => {
    this.entity.update(settings);
    this.writeStorage(this.entity.value);
    void this.persistentRepo.saveSettings(settings);
  };

  public readonly reset = (): ClientSettings => {
    const defaulted = this.entity.reset();
    this.writeStorage(defaulted);
    void this.persistentRepo.saveSettings(defaulted);
    return defaulted;
  };
}

export { SettingsRepository };
