type ThemePalette =
  | 'dino'
  | 'trex-monokai'
  | 'raptor-dracula'
  | 'pterodactyl-midnight'
  | 'triceratops-amber'
  | 'brachiosaurus-light';
type PanelOrientation = 'horizontal' | 'vertical';
type UiDensity = 'compact' | 'comfortable';
type JsonPresetName =
  | 'dino'
  | 'trex-monokai'
  | 'raptor-dracula'
  | 'pterodactyl-midnight'
  | 'triceratops-amber'
  | 'brachiosaurus-light'
  | 'custom';

interface JsonThemeSettings {
  preset: JsonPresetName;
  backgroundColor: string;
  keyColor: string;
  stringColor: string;
  numberColor: string;
  booleanColor: string;
  nullColor: string;
  bracketColor: string;
}

interface JsonColorField {
  key: keyof Omit<JsonThemeSettings, 'preset'>;
  label: string;
}

interface JsonPresetItem {
  id: JsonPresetName;
  label: string;
  icon: string;
}

interface JurassicThemeItem {
  id: ThemePalette;
  label: string;
  icon: string;
  description: string;
  previewColors: string[];
}

interface ClientSettings {
  theme: ThemePalette;
  orientation: PanelOrientation;
  density: UiDensity;
  defaultTimeout: number;
  defaultRetryAttempts: number;
  followRedirects: boolean;
  globalHeaders: Record<string, string>;
  jsonTheme: JsonThemeSettings;
}

interface ISettingsService {
  getSettings(): ClientSettings;
  updateSettings(partial: Partial<ClientSettings>): ClientSettings;
  resetSettings(): ClientSettings;
}

interface ILocalSettingsRepository {
  getSettings(): ClientSettings;
  save(settings: ClientSettings): void;
  reset(): ClientSettings;
  load(): Promise<void>;
}

export type {
  ThemePalette,
  PanelOrientation,
  UiDensity,
  JsonPresetName,
  JsonThemeSettings,
  JsonColorField,
  JsonPresetItem,
  JurassicThemeItem,
  ClientSettings,
  ISettingsService,
  ILocalSettingsRepository,
};

