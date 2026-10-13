import type {
  ClientSettings,
  CustomTheme,
  JsonPresetName,
  JsonThemeSettings,
} from './interfaces';

const JSON_THEME_PRESETS: Record<
  Exclude<JsonPresetName, 'custom'>,
  Omit<JsonThemeSettings, 'preset'>
> = {
  dino: {
    backgroundColor: '#141311',
    keyColor: '#86efac',
    stringColor: '#fcd34d',
    numberColor: '#60a5fa',
    booleanColor: '#f87171',
    nullColor: '#938d82',
    bracketColor: '#cdbca4',
  },
  'trex-monokai': {
    backgroundColor: '#23221c',
    keyColor: '#fb7185',
    stringColor: '#facc15',
    numberColor: '#c084fc',
    booleanColor: '#38bdf8',
    nullColor: '#78716c',
    bracketColor: '#f5f1eb',
  },
  'raptor-dracula': {
    backgroundColor: '#1e1d27',
    keyColor: '#f472b6',
    stringColor: '#fde047',
    numberColor: '#a78bfa',
    booleanColor: '#4ade80',
    nullColor: '#64748b',
    bracketColor: '#e2e8f0',
  },
  'pterodactyl-midnight': {
    backgroundColor: '#0e1726',
    keyColor: '#22d3ee',
    stringColor: '#34d399',
    numberColor: '#fb7185',
    booleanColor: '#fbbf24',
    nullColor: '#475569',
    bracketColor: '#94a3b8',
  },
  'triceratops-amber': {
    backgroundColor: '#1c1813',
    keyColor: '#fbbf24',
    stringColor: '#f59e0b',
    numberColor: '#38bdf8',
    booleanColor: '#f87171',
    nullColor: '#a8a29e',
    bracketColor: '#fed7aa',
  },
  'brachiosaurus-light': {
    backgroundColor: '#f8fafc',
    keyColor: '#0ea5e9',
    stringColor: '#f59e0b',
    numberColor: '#8b5cf6',
    booleanColor: '#ef4444',
    nullColor: '#64748b',
    bracketColor: '#94a3b8',
  },
};

class SettingsEntity {
  public static readonly DEFAULT_SETTINGS: Readonly<ClientSettings> = {
    theme: 'dino',
    orientation: 'horizontal',
    density: 'comfortable',
    defaultTimeout: 10000,
    defaultRetryAttempts: 0,
    followRedirects: true,
    globalHeaders: {},
    jsonTheme: {
      preset: 'dino',
      ...JSON_THEME_PRESETS.dino,
    },
    customThemes: [],
  };

  private currentSettings: ClientSettings;

  constructor(initial?: Partial<ClientSettings>) {
    this.currentSettings = {
      ...SettingsEntity.DEFAULT_SETTINGS,
      ...initial,
      jsonTheme: {
        ...SettingsEntity.DEFAULT_SETTINGS.jsonTheme,
        ...(initial?.jsonTheme ?? {}),
      },
      customThemes: initial?.customThemes ? [...initial.customThemes] : [],
    };
  }

  public get value(): ClientSettings {
    return {
      ...this.currentSettings,
      jsonTheme: { ...this.currentSettings.jsonTheme },
      customThemes: [...this.currentSettings.customThemes],
    };
  }

  public readonly update = (partial: Partial<ClientSettings>): ClientSettings => {
    this.currentSettings = {
      ...this.currentSettings,
      ...partial,
      jsonTheme: partial.jsonTheme
        ? { ...this.currentSettings.jsonTheme, ...partial.jsonTheme }
        : this.currentSettings.jsonTheme,
      customThemes: partial.customThemes
        ? [...partial.customThemes]
        : this.currentSettings.customThemes,
    };
    return { ...this.value };
  };

  public readonly addCustomTheme = (theme: CustomTheme): ClientSettings => {
    const existingIndex = this.currentSettings.customThemes.findIndex(
      (t) => t.id === theme.id,
    );
    if (existingIndex >= 0) {
      const nextThemes = [...this.currentSettings.customThemes];
      nextThemes[existingIndex] = theme;
      this.currentSettings.customThemes = nextThemes;
    } else {
      this.currentSettings.customThemes = [
        ...this.currentSettings.customThemes,
        theme,
      ];
    }
    return { ...this.value };
  };

  public readonly removeCustomTheme = (themeId: string): ClientSettings => {
    this.currentSettings.customThemes = this.currentSettings.customThemes.filter(
      (t) => t.id !== themeId,
    );
    if (this.currentSettings.theme === themeId) {
      this.currentSettings.theme = SettingsEntity.DEFAULT_SETTINGS.theme;
      this.currentSettings.jsonTheme = {
        ...SettingsEntity.DEFAULT_SETTINGS.jsonTheme,
      };
    }
    return { ...this.value };
  };

  public readonly getCustomTheme = (
    themeId: string,
  ): CustomTheme | undefined => {
    return this.currentSettings.customThemes.find((t) => t.id === themeId);
  };

  public readonly reset = (): ClientSettings => {
    this.currentSettings = {
      ...SettingsEntity.DEFAULT_SETTINGS,
      jsonTheme: { ...SettingsEntity.DEFAULT_SETTINGS.jsonTheme },
      customThemes: [],
    };
    return { ...this.value };
  };
}

export { JSON_THEME_PRESETS, SettingsEntity };
