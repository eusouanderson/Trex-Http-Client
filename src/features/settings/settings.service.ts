import type { ClientSettings, ISettingsService, ILocalSettingsRepository } from './interfaces';
import { SettingsEntity } from './settings.entity';

class SettingsService implements ISettingsService {
  private readonly entity: SettingsEntity;

  constructor(
    initial?: Partial<ClientSettings>,
    private readonly repository?: ILocalSettingsRepository,
  ) {
    const fromRepo = repository ? repository.getSettings() : undefined;
    this.entity = new SettingsEntity(initial ?? fromRepo);
  }

  public getSettings(): ClientSettings {
    if (this.repository) {
      return this.repository.getSettings();
    }
    return this.entity.value;
  }

  public updateSettings(partial: Partial<ClientSettings>): ClientSettings {
    if (this.repository) {
      const current = this.repository.getSettings();
      const updated = new SettingsEntity(current).update(partial);
      this.repository.save(updated);
      this.entity.update(partial);
      return updated;
    }
    return this.entity.update(partial);
  }

  public resetSettings(): ClientSettings {
    if (this.repository) {
      const defaulted = this.repository.reset();
      this.entity.reset();
      return defaulted;
    }
    return this.entity.reset();
  }
}

export { SettingsService };
