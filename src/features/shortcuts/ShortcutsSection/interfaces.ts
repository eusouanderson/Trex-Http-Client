import type { ComputedRef, Ref } from 'vue';
import type { ShortcutCategory } from '../../../core/shortcuts/interfaces';
import type { ShortcutItemViewModel } from '../interfaces';

interface ShortcutCategoryOption {
  id: 'all' | ShortcutCategory;
  label: string;
}

interface UseShortcutsSectionReturn {
  searchQuery: Ref<string>;
  selectedCategory: Ref<'all' | ShortcutCategory>;
  categories: ShortcutCategoryOption[];
  shortcuts: ComputedRef<ShortcutItemViewModel[]>;
  filteredShortcuts: ComputedRef<ShortcutItemViewModel[]>;
  recordingShortcutId: Ref<string | null>;
  recordedCombo: Ref<string>;
  conflictWarning: Ref<string | null>;
  startRecording: (id: string) => void;
  stopRecording: () => void;
  handleRecordKeyDown: (event: KeyboardEvent) => void;
  saveRecordedCombo: () => void;
  resetShortcut: (id: string) => void;
  resetAll: () => void;
}

export type { ShortcutCategoryOption, UseShortcutsSectionReturn };

