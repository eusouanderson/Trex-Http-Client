import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';
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
  const triggerRef = ref<HTMLElement | null>(null);
  const triggerRect = ref<DOMRect | null>(null);
  const isVisible = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const content = computed(() => service.resolveTooltipContent(props));
  const label = computed(() => content.value.label);
  const shortcutKey = computed(() => content.value.shortcutKey);
  const tooltipStyle = computed(() =>
    service.calculateTooltipStyle(triggerRect.value, props.position),
  );

  const clearPendingTimer = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const updatePosition = (): void => {
    if (triggerRef.value !== null) {
      triggerRect.value = triggerRef.value.getBoundingClientRect();
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
    updatePosition();

    const delay = props.delayMs ?? 300;

    if (delay <= 0) {
      isVisible.value = true;
      return;
    }

    timer = setTimeout(() => {
      updatePosition();
      isVisible.value = true;
      timer = null;
    }, delay);
  };

  const hide = (): void => {
    clearPendingTimer();
    isVisible.value = false;
  };

  const handleWindowScrollOrResize = (): void => {
    if (isVisible.value) {
      hide();
    }
  };

  if (getCurrentInstance()) {
    onMounted(() => {
      window.addEventListener('scroll', handleWindowScrollOrResize, true);
      window.addEventListener('resize', handleWindowScrollOrResize);
    });

    onBeforeUnmount(() => {
      clearPendingTimer();
      window.removeEventListener('scroll', handleWindowScrollOrResize, true);
      window.removeEventListener('resize', handleWindowScrollOrResize);
    });
  }

  return {
    triggerRef,
    isVisible,
    label,
    shortcutKey,
    tooltipStyle,
    show,
    hide,
  };
};

export { useShortcutTooltip };
