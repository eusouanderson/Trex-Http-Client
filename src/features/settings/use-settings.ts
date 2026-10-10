import { ref } from 'vue';
import type { ClientSettings, CustomTheme } from './interfaces';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';

const THEME_COLORS: Record<string, string> = {
  dino: '#141311',
  'trex-monokai': '#23221c',
  'raptor-dracula': '#1e1d27',
  'pterodactyl-midnight': '#0e1726',
  'triceratops-amber': '#1c1813',
  'brachiosaurus-light': '#f8fafc',
};

const resolveThemeMetaColor = (
  theme: string,
  settings: ClientSettings,
): string => {
  const builtin = THEME_COLORS[theme];
  if (typeof builtin === 'string') {
    return builtin;
  }
  const custom = settings.customThemes.find((t) => t.id === theme);
  if (custom) {
    return custom.colors.surfaceGround;
  }
  return '#141311';
};

const updateThemeMeta = (theme: string, currentSettings: ClientSettings): void => {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolveThemeMetaColor(theme, currentSettings));
  }
};

const settingsRepository = new SettingsRepository();
const settingsService = new SettingsService(undefined, settingsRepository);
const settingsState = ref<ClientSettings>(settingsService.getSettings());
const isSettingsOpen = ref<boolean>(false);

updateThemeMeta(settingsState.value.theme, settingsState.value);

void settingsRepository.load().then(() => {
  settingsState.value = settingsService.getSettings();
  updateThemeMeta(settingsState.value.theme, settingsState.value);
});

interface UseSettingsReturn {
  settings: typeof settingsState;
  isOpen: typeof isSettingsOpen;
  openSettings: () => void;
  closeSettings: () => void;
  updateSettings: (partial: Partial<ClientSettings>) => void;
  resetSettings: () => void;
  addCustomTheme: (theme: CustomTheme) => void;
  removeCustomTheme: (themeId: string) => void;
}

const useSettings = (): UseSettingsReturn => {
  const openSettings = (): void => {
    isSettingsOpen.value = true;
  };

  const closeSettings = (): void => {
    isSettingsOpen.value = false;
  };

  const updateSettings = (partial: Partial<ClientSettings>): void => {
    settingsState.value = settingsService.updateSettings(partial);
    if (typeof partial.theme === 'string') {
      updateThemeMeta(partial.theme, settingsState.value);
    }
  };

  const resetSettings = (): void => {
    settingsState.value = settingsService.resetSettings();
    updateThemeMeta(settingsState.value.theme, settingsState.value);
  };

  const addCustomTheme = (theme: CustomTheme): void => {
    settingsState.value = settingsService.addCustomTheme(theme);
  };

  const removeCustomTheme = (themeId: string): void => {
    settingsState.value = settingsService.removeCustomTheme(themeId);
    updateThemeMeta(settingsState.value.theme, settingsState.value);
  };

  return {
    settings: settingsState,
    isOpen: isSettingsOpen,
    openSettings,
    closeSettings,
    updateSettings,
    resetSettings,
    addCustomTheme,
    removeCustomTheme,
  };
};

export { useSettings };
