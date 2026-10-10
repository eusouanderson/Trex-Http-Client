import SettingsModal from './SettingsModal/index.vue';
import { SettingsEntity } from './settings.entity';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { ThemeParserService } from './theme-parser.service';
import { ThemeStyleService } from './theme-style.service';
import { useSettings } from './use-settings';

export type {
  ClientSettings,
  CustomTheme,
  CustomThemeColors,
  CustomThemeJsonTheme,
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
  ThemeParserService,
  ThemeStyleService,
  useSettings,
};
