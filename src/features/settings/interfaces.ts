type BuiltinThemePalette =
  | 'dino'
  | 'trex-monokai'
  | 'raptor-dracula'
  | 'pterodactyl-midnight'
  | 'triceratops-amber'
  | 'brachiosaurus-light';

type ThemePalette = BuiltinThemePalette | (string & {});

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
  id: string;
  label: string;
  icon: string;
  description: string;
  previewColors: string[];
}

interface CustomThemeColors {
  surfaceGround: string;
  surfacePanel: string;
  surfaceCard: string;
  surfaceBorder: string;
  surfaceHover: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
}

interface CustomThemeJsonTheme {
  backgroundColor: string;
  keyColor: string;
  stringColor: string;
  numberColor: string;
  booleanColor: string;
  nullColor: string;
  bracketColor: string;
}

interface CustomTheme {
  id: string;
  name: string;
  icon: string;
  description: string;
  previewColors: string[];
  colors: CustomThemeColors;
  jsonTheme: CustomThemeJsonTheme;
}

interface ClientSettings {
  theme: string;
  orientation: PanelOrientation;
  density: UiDensity;
  defaultTimeout: number;
  defaultRetryAttempts: number;
  followRedirects: boolean;
  globalHeaders: Record<string, string>;
  jsonTheme: JsonThemeSettings;
  customThemes: CustomTheme[];
}

interface ISettingsService {
  getSettings(): ClientSettings;
  updateSettings(partial: Partial<ClientSettings>): ClientSettings;
  resetSettings(): ClientSettings;
  addCustomTheme(theme: CustomTheme): ClientSettings;
  removeCustomTheme(themeId: string): ClientSettings;
  getCustomTheme(themeId: string): CustomTheme | undefined;
}

interface ILocalSettingsRepository {
  getSettings(): ClientSettings;
  save(settings: ClientSettings): void;
  reset(): ClientSettings;
  load(): Promise<void>;
}

export type {
  BuiltinThemePalette,
  ThemePalette,
  PanelOrientation,
  UiDensity,
  JsonPresetName,
  JsonThemeSettings,
  JsonColorField,
  JsonPresetItem,
  JurassicThemeItem,
  CustomThemeColors,
  CustomThemeJsonTheme,
  CustomTheme,
  ClientSettings,
  ISettingsService,
  ILocalSettingsRepository,
};
