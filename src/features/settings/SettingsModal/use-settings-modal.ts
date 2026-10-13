import type { ComputedRef, Ref } from 'vue';
import { computed, ref } from 'vue';
import type {
  CustomTheme,
  JsonColorField,
  JsonPresetItem,
  JsonPresetName,
  JsonThemeSettings,
  JurassicThemeItem,
  PanelOrientation,
  UiDensity,
} from '../interfaces';
import { JSON_THEME_PRESETS } from '../settings.entity';
import { ThemeParserService } from '../theme-parser.service';
import { useSettings } from '../use-settings';

type SettingsTab = 'general' | 'theme' | 'json' | 'network';

const JSON_PREVIEW_CODE = `{
  "request": {
    "method": "POST",
    "endpoint": "/api/v1/fossils",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer trex_token"
    }
  },
  "species": "Tyrannosaurus Rex",
  "period": "Late Cretaceous",
  "discovered": 1902,
  "is_carnivore": true,
  "is_extinct": true,
  "dna_sequence": null,
  "specimens": [
    "Sue",
    "Stan",
    "Scotty"
  ]
}`;

const JURASSIC_THEMES_LIST: JurassicThemeItem[] = [
  {
    id: 'dino',
    label: 'TRex Jurassic',
    icon: 'logos/Trex.png',
    description: 'Tema fóssil profundo com acentos verde esmeralda e tons cretáceos.',
    previewColors: ['#141311', '#1c1b18', '#22c55e', '#86efac', '#fcd34d'],
  },
  {
    id: 'trex-monokai',
    label: 'TRex Monokai',
    icon: '🌋',
    description: 'Basalto vulcânico com magma róseo vibrante, ouro fóssil e ametista.',
    previewColors: ['#1a1917', '#23221c', '#fb7185', '#facc15', '#c084fc'],
  },
  {
    id: 'raptor-dracula',
    label: 'Raptor Dracula',
    icon: '🩸',
    description: 'Sombra de caçador noturno com magenta raptor, lavanda e verde tóxico.',
    previewColors: ['#14131c', '#1e1d27', '#f472b6', '#a78bfa', '#4ade80'],
  },
  {
    id: 'pterodactyl-midnight',
    label: 'Pterodactyl Midnight',
    icon: '🌌',
    description: 'Céu profundo cretáceo com ciano elétrico, esmeralda alada e coral.',
    previewColors: ['#080e18', '#0e1726', '#22d3ee', '#34d399', '#fb7185'],
  },
  {
    id: 'triceratops-amber',
    label: 'Triceratops Amber',
    icon: '🪨',
    description: 'Resina fóssil petrificada com chifre âmbar dourado e mel pré-histórico.',
    previewColors: ['#15120e', '#1c1813', '#fbbf24', '#f59e0b', '#fed7aa'],
  },
  {
    id: 'brachiosaurus-light',
    label: 'Brachiosaurus Light',
    icon: '🦕',
    description: 'Um tema claro e tranquilo inspirado nas grandes planícies do jurássico, com tons azuis e esmeralda.',
    previewColors: ['#f8fafc', '#f1f5f9', '#0ea5e9', '#38bdf8', '#8b5cf6'],
  },
];

const JSON_PRESETS_LIST: JsonPresetItem[] = [
  { id: 'dino', label: 'TRex Jurassic', icon: 'logos/Trex.png' },
  { id: 'trex-monokai', label: 'TRex Monokai', icon: '🌋' },
  { id: 'raptor-dracula', label: 'Raptor Dracula', icon: '🩸' },
  { id: 'pterodactyl-midnight', label: 'Pterodactyl Midnight', icon: '🌌' },
  { id: 'triceratops-amber', label: 'Triceratops Amber', icon: '🪨' },
  { id: 'brachiosaurus-light', label: 'Brachiosaurus Light', icon: '🦕' },
];

const JSON_COLOR_FIELDS: JsonColorField[] = [
  { key: 'backgroundColor', label: 'Fundo do Editor' },
  { key: 'bracketColor', label: 'Chaves & Colchetes { } [ ]' },
  { key: 'keyColor', label: 'Propriedades / Chaves' },
  { key: 'stringColor', label: 'Strings / Textos' },
  { key: 'numberColor', label: 'Números' },
  { key: 'booleanColor', label: 'Booleanos (true/false)' },
  { key: 'nullColor', label: 'Nulos (null)' },
];

const themeParser = new ThemeParserService();

interface UseSettingsModalReturn {
  activeTab: typeof activeTabState;
  settings: ReturnType<typeof useSettings>['settings'];
  jurassicThemes: ComputedRef<JurassicThemeItem[]>;
  customThemes: ComputedRef<CustomTheme[]>;
  customThemeError: Ref<string | null>;
  jsonPreviewCode: string;
  jsonPresets: JsonPresetItem[];
  jsonColorFields: JsonColorField[];
  setTab: (tab: SettingsTab) => void;
  setTheme: (themeId: string) => void;
  setOrientation: (orientation: PanelOrientation) => void;
  setDensity: (density: UiDensity) => void;
  setTimeoutValue: (timeoutMs: number) => void;
  setRetryAttempts: (attempts: number) => void;
  toggleFollowRedirects: () => void;
  setJsonColor: (field: keyof Omit<JsonThemeSettings, 'preset'>, color: string) => void;
  setJsonPreset: (preset: JsonPresetName) => void;
  importCustomTheme: (jsonString: string) => { success: boolean; error?: string };
  deleteCustomTheme: (themeId: string) => void;
  downloadThemeTemplate: () => void;
  resetAll: () => void;
  close: () => void;
}

const activeTabState = ref<SettingsTab>('general');
const customThemeErrorState = ref<string | null>(null);

const useSettingsModal = (): UseSettingsModalReturn => {
  const {
    settings,
    updateSettings,
    resetSettings,
    closeSettings,
    addCustomTheme,
    removeCustomTheme,
  } = useSettings();

  const jurassicThemes = computed<JurassicThemeItem[]>(() => {
    const customItems: JurassicThemeItem[] = settings.value.customThemes.map((c) => ({
      id: c.id,
      label: c.name,
      icon: c.icon,
      description: c.description,
      previewColors: c.previewColors,
    }));
    return [...JURASSIC_THEMES_LIST, ...customItems];
  });

  const customThemes = computed<CustomTheme[]>(() => settings.value.customThemes);

  const setTab = (tab: SettingsTab): void => {
    activeTabState.value = tab;
  };

  const setTheme = (themeId: string): void => {
    if (Object.prototype.hasOwnProperty.call(JSON_THEME_PRESETS, themeId)) {
      const builtinPreset = JSON_THEME_PRESETS[themeId as keyof typeof JSON_THEME_PRESETS];
      updateSettings({
        theme: themeId,
        jsonTheme: {
          preset: themeId as JsonPresetName,
          ...builtinPreset,
        },
      });
      return;
    }

    const custom = settings.value.customThemes.find((t) => t.id === themeId);
    if (custom) {
      updateSettings({
        theme: themeId,
        jsonTheme: {
          preset: 'custom',
          backgroundColor: custom.jsonTheme.backgroundColor,
          keyColor: custom.jsonTheme.keyColor,
          stringColor: custom.jsonTheme.stringColor,
          numberColor: custom.jsonTheme.numberColor,
          booleanColor: custom.jsonTheme.booleanColor,
          nullColor: custom.jsonTheme.nullColor,
          bracketColor: custom.jsonTheme.bracketColor,
        },
      });
    }
  };

  const setOrientation = (orientation: PanelOrientation): void => {
    updateSettings({ orientation });
  };

  const setDensity = (density: UiDensity): void => {
    updateSettings({ density });
  };

  const setTimeoutValue = (timeoutMs: number): void => {
    updateSettings({ defaultTimeout: timeoutMs });
  };

  const setRetryAttempts = (attempts: number): void => {
    updateSettings({ defaultRetryAttempts: attempts });
  };

  const toggleFollowRedirects = (): void => {
    updateSettings({ followRedirects: !settings.value.followRedirects });
  };

  const setJsonColor = (
    field: keyof Omit<JsonThemeSettings, 'preset'>,
    color: string,
  ): void => {
    updateSettings({
      jsonTheme: {
        ...settings.value.jsonTheme,
        preset: 'custom',
        [field]: color,
      },
    });
  };

  const setJsonPreset = (preset: JsonPresetName): void => {
    if (preset === 'custom') {
      updateSettings({
        jsonTheme: {
          ...settings.value.jsonTheme,
          preset: 'custom',
        },
      });
      return;
    }

    setTheme(preset);
  };

  const importCustomTheme = (
    jsonString: string,
  ): { success: boolean; error?: string } => {
    try {
      const parsed = themeParser.parse(jsonString);
      addCustomTheme(parsed);
      setTheme(parsed.id);
      customThemeErrorState.value = null;
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar o arquivo JSON de tema.';
      customThemeErrorState.value = msg;
      return { success: false, error: msg };
    }
  };

  const deleteCustomTheme = (themeId: string): void => {
    removeCustomTheme(themeId);
  };

  const downloadThemeTemplate = (): void => {
    if (typeof window === 'undefined' || typeof window.URL.createObjectURL !== 'function') return;
    const templateContent = themeParser.generateTemplate();
    const blob = new Blob([templateContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trex-theme-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetAll = (): void => {
    resetSettings();
    customThemeErrorState.value = null;
  };

  const close = (): void => {
    closeSettings();
  };

  return {
    activeTab: activeTabState,
    settings,
    jurassicThemes,
    customThemes,
    customThemeError: customThemeErrorState,
    jsonPreviewCode: JSON_PREVIEW_CODE,
    jsonPresets: JSON_PRESETS_LIST,
    jsonColorFields: JSON_COLOR_FIELDS,
    setTab,
    setTheme,
    setOrientation,
    setDensity,
    setTimeoutValue,
    setRetryAttempts,
    toggleFollowRedirects,
    setJsonColor,
    setJsonPreset,
    importCustomTheme,
    deleteCustomTheme,
    downloadThemeTemplate,
    resetAll,
    close,
  };
};

export { useSettingsModal };
export type { SettingsTab };
