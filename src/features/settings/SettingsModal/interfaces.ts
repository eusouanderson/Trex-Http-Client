interface SettingsModalProps {
  modelValue?: boolean;
}

type SettingsModalEmits = (e: 'update:modelValue', value: boolean) => void;

export type { SettingsModalProps, SettingsModalEmits };
