import CommandPalette from './CommandPalette/index.vue';
import ShortcutsSection from './ShortcutsSection/index.vue';
import { useShortcuts } from './use-shortcuts';
import {
  ShortcutRequestService,
  shortcutRequestService,
} from './shortcut-request.service';
import type {
  CommandPaletteItem,
  IShortcutRequestService,
  ShortcutItemViewModel,
  ShortcutRequestGenerationResult,
  UseShortcutsReturn,
} from './interfaces';

export {
  CommandPalette,
  ShortcutsSection,
  ShortcutRequestService,
  shortcutRequestService,
  useShortcuts,
};

export type {
  CommandPaletteItem,
  IShortcutRequestService,
  ShortcutItemViewModel,
  ShortcutRequestGenerationResult,
  UseShortcutsReturn,
};


