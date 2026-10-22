import type { ComputedRef, Ref } from 'vue';
import type { CommandPaletteItem } from '../interfaces';

interface CommandPaletteProps {
  isOpen: boolean;
}

type CommandPaletteEmits = (e: 'close') => void;

interface UseCommandPaletteReturn {
  searchQuery: Ref<string>;
  filteredCommands: ComputedRef<CommandPaletteItem[]>;
  selectedIndex: Ref<number>;
  selectNext: () => void;
  selectPrev: () => void;
  executeSelected: () => void;
  executeItem: (item: CommandPaletteItem) => void;
  close: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
}

export type { CommandPaletteProps, CommandPaletteEmits, UseCommandPaletteReturn };
