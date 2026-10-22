import type { ClientSettings } from '../../../features/settings/interfaces';

interface SettingsRecord {
  id: string;
  data: ClientSettings;
  updatedAt: number;
}

export type { SettingsRecord };
