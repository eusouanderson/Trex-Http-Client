import { computed, ref } from 'vue';
import type { ShortcutCategory } from '../../../core/shortcuts/interfaces';
import { useShortcuts } from '../use-shortcuts';
import type { ShortcutItemViewModel } from '../interfaces';
import type {
  ShortcutCategoryOption,
  UseShortcutsSectionReturn,
} from './interfaces';

const CATEGORIES: ShortcutCategoryOption[] = [
  { id: 'all', label: 'Todos' },
  { id: 'general', label: 'Geral' },
  { id: 'requests', label: 'Requisições' },
  { id: 'navigation', label: 'Navegação' },
  { id: 'tabs', label: 'Abas' },
  { id: 'collections', label: 'Collections' },
  { id: 'environments', label: 'Ambientes' },
  { id: 'settings', label: 'Configurações' },
];

const useShortcutsSection = (): UseShortcutsSectionReturn => {
  const {
    shortcuts,
    updateShortcutCombo,
    resetShortcutCombo,
    resetAllShortcuts,
  } = useShortcuts();

  const searchQuery = ref<string>('');
  const selectedCategory = ref<'all' | ShortcutCategory>('all');
  const recordingShortcutId = ref<string | null>(null);
  const recordedCombo = ref<string>('');
  const conflictWarning = ref<string | null>(null);

  const filteredShortcuts = computed<ShortcutItemViewModel[]>(() => {
    let list = shortcuts.value;
    if (selectedCategory.value !== 'all') {
      list = list.filter((s) => s.category === selectedCategory.value);
    }
    const q = searchQuery.value.trim().toLowerCase();
    if (q.length === 0) {
      return list;
    }
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.activeCombo.toLowerCase().includes(q) ||
        s.formattedCombo.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  });

  const startRecording = (id: string): void => {
    recordingShortcutId.value = id;
    recordedCombo.value = '';
    conflictWarning.value = null;
  };

  const stopRecording = (): void => {
    recordingShortcutId.value = null;
    recordedCombo.value = '';
  };

  const handleRecordKeyDown = (event: KeyboardEvent): void => {
    if (recordingShortcutId.value === null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      stopRecording();
      return;
    }

    const key = event.key.toLowerCase();
    const modifierKeys = ['control', 'alt', 'shift', 'meta'];
    if (modifierKeys.includes(key)) {
      return;
    }

    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');

    parts.push(key);

    recordedCombo.value = parts.join('+');
  };

  const saveRecordedCombo = (): void => {
    if (recordingShortcutId.value === null || recordedCombo.value.length === 0) {
      stopRecording();
      return;
    }

    const conflicts = updateShortcutCombo(
      recordingShortcutId.value,
      recordedCombo.value,
    );

    if (conflicts.length > 0) {
      const conflictNames = conflicts.map((c) => c.conflictingName).join(', ');
      conflictWarning.value = `Atenção: combinação já usada por: ${conflictNames}.`;
    }

    stopRecording();
  };

  const resetShortcut = (id: string): void => {
    resetShortcutCombo(id);
  };

  const resetAll = (): void => {
    resetAllShortcuts();
  };

  return {
    searchQuery,
    selectedCategory,
    categories: CATEGORIES,
    shortcuts,
    filteredShortcuts,
    recordingShortcutId,
    recordedCombo,
    conflictWarning,
    startRecording,
    stopRecording,
    handleRecordKeyDown,
    saveRecordedCombo,
    resetShortcut,
    resetAll,
  };
};

export { useShortcutsSection };
