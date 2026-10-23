import type { ComputedRef, Ref } from 'vue';

type ShortcutTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface ShortcutTooltipProps {
  text?: string;
  shortcutId?: string;
  position?: ShortcutTooltipPosition;
  disabled?: boolean;
  delayMs?: number;
}

interface ShortcutTooltipContent {
  label: string;
  shortcutKey: string;
}

interface IShortcutTooltipService {
  getPositionClass(position?: ShortcutTooltipPosition): string;
  resolveTooltipContent(props: ShortcutTooltipProps): ShortcutTooltipContent;
}

interface UseShortcutTooltipReturn {
  isVisible: Ref<boolean>;
  label: ComputedRef<string>;
  shortcutKey: ComputedRef<string>;
  positionClass: ComputedRef<string>;
  show: () => void;
  hide: () => void;
}

export type {
  ShortcutTooltipPosition,
  ShortcutTooltipProps,
  ShortcutTooltipContent,
  IShortcutTooltipService,
  UseShortcutTooltipReturn,
};

