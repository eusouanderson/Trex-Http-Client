import { computed, getCurrentInstance, onBeforeUnmount, ref } from 'vue';
import type {
  IShortcutTooltipService,
  ShortcutTooltipProps,
  UseShortcutTooltipReturn,
} from './interfaces';
import { shortcutTooltipService } from './shortcut-tooltip.service';

const useShortcutTooltip = (
  props: ShortcutTooltipProps,
  service: IShortcutTooltipService = shortcutTooltipService,
): UseShortcutTooltipReturn => {
  const isVisible = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const content = computed(() => service.resolveTooltipContent(props));
  const label = computed(() => content.value.label);
  const shortcutKey = computed(() => content.value.shortcutKey);
  const positionClass = computed(() =>
    service.getPositionClass(props.position),
  );

  const clearPendingTimer = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const show = (): void => {
    if (props.disabled === true) {
      return;
    }

    if (label.value.length === 0 && shortcutKey.value.length === 0) {
      return;
    }

    clearPendingTimer();

    const delay = props.delayMs ?? 300;

    if (delay <= 0) {
      isVisible.value = true;
      return;
    }

    timer = setTimeout(() => {
      isVisible.value = true;
      timer = null;
    }, delay);
  };

  const hide = (): void => {
    clearPendingTimer();
    isVisible.value = false;
  };

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      clearPendingTimer();
    });
  }

  return {
    isVisible,
    label,
    shortcutKey,
    positionClass,
    show,
    hide,
  };
};

export { useShortcutTooltip };

