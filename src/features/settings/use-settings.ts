import { ref } from 'vue';
import type { ClientSettings, ThemePalette } from './interfaces';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';

const THEME_COLORS: Record<ThemePalette, string> = {
  dino: '#141311',
  'trex-monokai': '#23221c',
  'raptor-dracula': '#1e1d27',
  'pterodactyl-midnight': '#0e1726',
  'triceratops-amber': '#1c1813',
  'brachiosaurus-light': '#f8fafc',
};

const updateThemeMeta = (theme: ThemePalette): void => {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_COLORS[theme]);
  }
};

const settingsRepository = new SettingsRepository();
const settingsService = new SettingsService(undefined, settingsRepository);
const settingsState = ref<ClientSettings>(settingsService.getSettings());
const isSettingsOpen = ref<boolean>(false);

updateThemeMeta(settingsState.value.theme);

void settingsRepository.load().then(() => {
  settingsState.value = settingsService.getSettings();
  updateThemeMeta(settingsState.value.theme);
});

interface UseSettingsReturn {
  settings: typeof settingsState;
  isOpen: typeof isSettingsOpen;
  openSettings: () => void;
  closeSettings: () => void;
  updateSettings: (partial: Partial<ClientSettings>) => void;
  resetSettings: () => void;
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
    if (partial.theme) {
      updateThemeMeta(partial.theme);
    }
  };

  const resetSettings = (): void => {
    settingsState.value = settingsService.resetSettings();
    updateThemeMeta(settingsState.value.theme);
  };

  return {
    settings: settingsState,
    isOpen: isSettingsOpen,
    openSettings,
    closeSettings,
    updateSettings,
    resetSettings,
  };
};

export { useSettings };
