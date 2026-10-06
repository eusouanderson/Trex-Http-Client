import type { ClientSettings } from '../../../features/settings/interfaces';
import type { ISettingsRepository } from '../interfaces';
import type { TrexDexieDatabase, SettingsRecord } from './dexie-database';
import { validateClientSettings } from '../schemas';

const SETTINGS_ID = 'user_client_settings';

class DexieSettingsRepository implements ISettingsRepository {
  constructor(private readonly db: TrexDexieDatabase) {}

  public readonly getSettings = async (): Promise<ClientSettings | null> => {
    const record = await this.db.settings.get(SETTINGS_ID);
    if (!record) return null;
    return validateClientSettings(record.data);
  };

  public readonly saveSettings = async (settings: ClientSettings): Promise<ClientSettings> => {
    const validated = validateClientSettings(settings);
    const record: SettingsRecord = {
      id: SETTINGS_ID,
      data: validated,
      updatedAt: Date.now(),
    };
    await this.db.settings.put(record);
    return validated;
  };
}

export { DexieSettingsRepository, SETTINGS_ID };

