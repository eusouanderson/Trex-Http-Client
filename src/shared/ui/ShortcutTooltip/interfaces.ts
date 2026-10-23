import type { ComputedRef, CSSProperties, Ref } from 'vue';

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

type TooltipPositionStyle = CSSProperties;

interface IShortcutTooltipService {
  calculateTooltipStyle(
    rect: DOMRect | null,
    position?: ShortcutTooltipPosition,
  ): TooltipPositionStyle;
  resolveTooltipContent(props: ShortcutTooltipProps): ShortcutTooltipContent;
}

interface UseShortcutTooltipReturn {
  triggerRef: Ref<HTMLElement | null>;
  isVisible: Ref<boolean>;
  label: ComputedRef<string>;
  shortcutKey: ComputedRef<string>;
  tooltipStyle: ComputedRef<TooltipPositionStyle>;
  show: () => void;
  hide: () => void;
}

export type {
  ShortcutTooltipPosition,
  ShortcutTooltipProps,
  ShortcutTooltipContent,
  TooltipPositionStyle,
  IShortcutTooltipService,
  UseShortcutTooltipReturn,
};
