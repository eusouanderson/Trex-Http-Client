type ShortcutCategory =
  | 'general'
  | 'requests'
  | 'navigation'
  | 'tabs'
  | 'collections'
  | 'environments'
  | 'settings';

interface ShortcutDefinition {
  id: string;
  name: string;
  description: string;
  category: ShortcutCategory;
  defaultKeyCombo: string;
  allowInInputs?: boolean;
  action: () => void | Promise<void>;
  isEnabled?: () => boolean;
}

interface ParsedKeyCombo {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

interface ShortcutConflict {
  shortcutId: string;
  conflictingShortcutId: string;
  conflictingName: string;
  keyCombo: string;
}

interface IPlatformService {
  isMac(): boolean;
  formatKeyCombo(combo: string): string;
  getModifierLabel(modifier: 'ctrl' | 'alt' | 'shift' | 'meta'): string;
}

interface IShortcutMatcherService {
  parseCombo(combo: string): ParsedKeyCombo;
  normalizeCombo(combo: string): string;
  matches(event: KeyboardEvent, combo: string, isMac?: boolean): boolean;
  isInputTarget(target: EventTarget | null): boolean;
  isEventComposing(event: KeyboardEvent): boolean;
}

interface IShortcutRegistryService {
  register(shortcut: ShortcutDefinition): void;
  unregister(id: string): void;
  get(id: string): ShortcutDefinition | undefined;
  getAll(revision?: number): ShortcutDefinition[];
  getByCategory(category: ShortcutCategory): ShortcutDefinition[];
  setCustomCombo(id: string, combo: string): void;
  resetCustomCombo(id: string): void;
  resetAll(): void;
  getActiveCombo(shortcut: ShortcutDefinition): string;
  findConflicts(id: string, candidateCombo: string): ShortcutConflict[];
  handleKeyEvent(event: KeyboardEvent): boolean;
  getCustomCombos(): Record<string, string>;
  loadCustomCombos(combos: Record<string, string>): void;
}

export type {
  ShortcutCategory,
  ShortcutDefinition,
  ParsedKeyCombo,
  ShortcutConflict,
  IPlatformService,
  IShortcutMatcherService,
  IShortcutRegistryService,
};
