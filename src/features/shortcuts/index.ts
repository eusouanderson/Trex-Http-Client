import CommandPalette from './CommandPalette/index.vue';
import ShortcutsSection from './ShortcutsSection/index.vue';
import { useShortcuts } from './use-shortcuts';
import type {
  CommandPaletteItem,
  ShortcutItemViewModel,
  UseShortcutsReturn,
} from './interfaces';

export { CommandPalette, ShortcutsSection, useShortcuts };

export type {
  CommandPaletteItem,
  ShortcutItemViewModel,
  UseShortcutsReturn,
};

