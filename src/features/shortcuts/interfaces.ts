import type { Ref, ComputedRef } from 'vue';
import type {
  ShortcutCategory,
  ShortcutConflict,
} from '../../core/shortcuts/interfaces';

interface ShortcutItemViewModel {
  id: string;
  name: string;
  description: string;
  category: ShortcutCategory;
  defaultCombo: string;
  activeCombo: string;
  formattedCombo: string;
  isCustom: boolean;
  allowInInputs: boolean;
}

interface CommandPaletteItem {
  id: string;
  title: string;
  description: string;
  category: ShortcutCategory;
  formattedShortcut: string;
  action: () => void | Promise<void>;
}

interface UseShortcutsReturn {
  shortcuts: ComputedRef<ShortcutItemViewModel[]>;
  searchQuery: Ref<string>;
  filteredShortcuts: ComputedRef<ShortcutItemViewModel[]>;
  isCommandPaletteOpen: Ref<boolean>;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  updateShortcutCombo: (id: string, newCombo: string) => ShortcutConflict[];
  resetShortcutCombo: (id: string) => void;
  resetAllShortcuts: () => void;
  formatCombo: (combo: string) => string;
}

export type {
  ShortcutItemViewModel,
  CommandPaletteItem,
  UseShortcutsReturn,
};

