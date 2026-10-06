import type { IPersistenceStorage } from '../interfaces';
import type { Environment } from '../../../features/environments/interfaces';
import { validateEnvironment } from '../schemas';

interface MigrationResult {
  migratedEnvironmentsCount: number;
  migratedActiveEnvironment: boolean;
}

class LocalStorageMigrator {
  private readonly LEGACY_ENVS_KEY = 'trex_environments';
  private readonly LEGACY_ACTIVE_ENV_KEY = 'trex_active_environment';
  private readonly APP_STATE_ACTIVE_ENV_KEY = 'active_environment_id';

  constructor(private readonly storage: IPersistenceStorage) {}

  public readonly migrate = async (): Promise<MigrationResult> => {
    let migratedEnvironmentsCount = 0;
    let migratedActiveEnvironment = false;

    const legacyEnvsRaw = localStorage.getItem(this.LEGACY_ENVS_KEY);
    if (legacyEnvsRaw !== null && legacyEnvsRaw.length > 0) {
      const existingInDb = await this.storage.environments.getAll();

      if (existingInDb.length === 0) {
        try {
          const parsed = JSON.parse(legacyEnvsRaw) as unknown[];
          const validEnvs: Environment[] = [];

          for (const item of parsed) {
            try {
              validEnvs.push(validateEnvironment(item));
            } catch {
              continue;
            }
          }

          if (validEnvs.length > 0) {
            await this.storage.environments.bulkSave(validEnvs);
            migratedEnvironmentsCount = validEnvs.length;
          }
        } catch {
          migratedEnvironmentsCount = 0;
        }
      }

      localStorage.removeItem(this.LEGACY_ENVS_KEY);
    }

    const legacyActiveEnvId = localStorage.getItem(this.LEGACY_ACTIVE_ENV_KEY);
    if (legacyActiveEnvId !== null && legacyActiveEnvId.length > 0) {
      await this.storage.appState.set(this.APP_STATE_ACTIVE_ENV_KEY, legacyActiveEnvId);
      localStorage.removeItem(this.LEGACY_ACTIVE_ENV_KEY);
      migratedActiveEnvironment = true;
    }

    return {
      migratedEnvironmentsCount,
      migratedActiveEnvironment,
    };
  };
}

export { LocalStorageMigrator, type MigrationResult };
