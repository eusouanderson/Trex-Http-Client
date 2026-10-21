type SettingsTab = 'general' | 'theme' | 'json' | 'network' | 'contributors' | 'environments';

interface SettingsModalProps {
  modelValue?: boolean;
}

interface SettingsModalEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'openEnvironmentManager'): void;
}

interface UseSettingsModalOptions {
  onOpenEnvironmentManager?: () => void;
}

export type { SettingsModalProps, SettingsModalEmits, SettingsTab, UseSettingsModalOptions };
