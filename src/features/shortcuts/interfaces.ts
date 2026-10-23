import type { Ref, ComputedRef } from 'vue';
import type {
  ShortcutCategory,
  ShortcutConflict,
} from '../../core/shortcuts/interfaces';
import type { Collection, CreateItemInput } from '../collections/interfaces';
import type { RequestTab } from '../request/interfaces';

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

interface ShortcutRequestGenerationResult {
  itemInput: CreateItemInput;
  tabInput: Omit<RequestTab, 'id'>;
}

interface IShortcutRequestService {
  resolveTargetCollection(
    collections: Collection[],
    activeTab?: RequestTab | null,
    selectedItemId?: string | null,
  ): Collection | null;
  createNewRequest(
    targetCollectionId: string,
    initial?: Partial<CreateItemInput>,
  ): ShortcutRequestGenerationResult;
  duplicateRequest(
    sourceTab: RequestTab,
    targetCollectionId: string,
  ): ShortcutRequestGenerationResult;
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
  ShortcutRequestGenerationResult,
  IShortcutRequestService,
  UseShortcutsReturn,
};


