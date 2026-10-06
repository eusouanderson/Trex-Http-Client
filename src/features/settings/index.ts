import SettingsModal from './SettingsModal/index.vue';
import { SettingsEntity } from './settings.entity';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { useSettings } from './use-settings';

export type {
  ClientSettings,
  ISettingsService,
  ILocalSettingsRepository,
  PanelOrientation,
  ThemePalette,
  UiDensity,
} from './interfaces';

export {
  SettingsEntity,
  SettingsModal,
  SettingsService,
  SettingsRepository,
  useSettings,
};

