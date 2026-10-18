interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  action: () => void;
}

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface ContextMenuEmits {
  (e: 'close'): void;
  (e: 'select', item: ContextMenuItem): void;
}

export type {
  ContextMenuItem,
  ContextMenuProps,
  ContextMenuEmits,
};

