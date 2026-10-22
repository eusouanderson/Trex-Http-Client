import { computed, ref, watch } from 'vue';
import { platformService, shortcutRegistryService } from '../../../core/shortcuts';
import { useShortcuts } from '../use-shortcuts';
import type { CommandPaletteItem } from '../interfaces';
import type { CommandPaletteEmits, UseCommandPaletteReturn } from './interfaces';

interface UseCommandPaletteOptions {
  emit?: CommandPaletteEmits;
}

const useCommandPalette = (options?: UseCommandPaletteOptions): UseCommandPaletteReturn => {
  useShortcuts();
  const searchQuery = ref<string>('');
  const selectedIndex = ref<number>(0);

  const allCommands = computed<CommandPaletteItem[]>(() => {
    return shortcutRegistryService.getAll().map((s) => {
      const activeCombo = shortcutRegistryService.getActiveCombo(s);
      return {
        id: s.id,
        title: s.name,
        description: s.description,
        category: s.category,
        formattedShortcut: platformService.formatKeyCombo(activeCombo),
        action: s.action,
      };
    });
  });

  const filteredCommands = computed<CommandPaletteItem[]>(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) {
      return allCommands.value;
    }
    return allCommands.value.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.formattedShortcut.toLowerCase().includes(q),
    );
  });

  watch(filteredCommands, (newList) => {
    if (selectedIndex.value >= newList.length) {
      selectedIndex.value = Math.max(0, newList.length - 1);
    }
  });

  const close = (): void => {
    searchQuery.value = '';
    selectedIndex.value = 0;
    if (options?.emit) {
      options.emit('close');
    }
  };

  const selectNext = (): void => {
    const total = filteredCommands.value.length;
    if (total === 0) return;
    selectedIndex.value = (selectedIndex.value + 1) % total;
  };

  const selectPrev = (): void => {
    const total = filteredCommands.value.length;
    if (total === 0) return;
    selectedIndex.value = (selectedIndex.value - 1 + total) % total;
  };

  const executeItem = (item: CommandPaletteItem): void => {
    close();
    void item.action();
  };

  const executeSelected = (): void => {
    const target = filteredCommands.value[selectedIndex.value];
    if (target) {
      executeItem(target);
    }
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectNext();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectPrev();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      executeSelected();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  return {
    searchQuery,
    filteredCommands,
    selectedIndex,
    selectNext,
    selectPrev,
    executeSelected,
    executeItem,
    close,
    handleKeydown,
  };
};

export { useCommandPalette };
