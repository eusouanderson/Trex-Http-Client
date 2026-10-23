import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import type { IShortcutTooltipService, ShortcutTooltipProps } from '../interfaces';
import { useShortcutTooltip } from '../use-shortcut-tooltip';

describe('useShortcutTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const createMockService = (
    label = 'Enviar Requisição',
    shortcutKey = 'Ctrl + Enter',
    positionClass = 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  ): IShortcutTooltipService => {
    return {
      getPositionClass: () => positionClass,
      resolveTooltipContent: () => ({ label, shortcutKey }),
    };
  };

  it('initializes with hidden state and computes values from service', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
      position: 'top',
    });
    const service = createMockService();
    const { isVisible, label, shortcutKey, positionClass } = useShortcutTooltip(props, service);

    expect(isVisible.value).toBe(false);
    expect(label.value).toBe('Enviar Requisição');
    expect(shortcutKey.value).toBe('Ctrl + Enter');
    expect(positionClass.value).toBe('bottom-full left-1/2 -translate-x-1/2 mb-1.5');
  });

  it('shows tooltip immediately when delayMs is 0 or negative', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
      delayMs: 0,
    });
    const service = createMockService();
    const { isVisible, show } = useShortcutTooltip(props, service);

    show();
    expect(isVisible.value).toBe(true);
  });

  it('delays showing tooltip by delayMs duration', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
      delayMs: 250,
    });
    const service = createMockService();
    const { isVisible, show, hide } = useShortcutTooltip(props, service);

    show();
    expect(isVisible.value).toBe(false);

    vi.advanceTimersByTime(249);
    expect(isVisible.value).toBe(false);

    vi.advanceTimersByTime(1);
    expect(isVisible.value).toBe(true);

    hide();
    expect(isVisible.value).toBe(false);
  });

  it('uses default 300ms delay when delayMs is not specified', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
    });
    const service = createMockService();
    const { isVisible, show } = useShortcutTooltip(props, service);

    show();
    expect(isVisible.value).toBe(false);

    vi.advanceTimersByTime(299);
    expect(isVisible.value).toBe(false);

    vi.advanceTimersByTime(1);
    expect(isVisible.value).toBe(true);
  });

  it('re-starts timer if show is called consecutively before timeout fires', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
      delayMs: 300,
    });
    const service = createMockService();
    const { isVisible, show } = useShortcutTooltip(props, service);

    show();
    vi.advanceTimersByTime(200);
    expect(isVisible.value).toBe(false);

    show();
    vi.advanceTimersByTime(200);
    expect(isVisible.value).toBe(false);

    vi.advanceTimersByTime(100);
    expect(isVisible.value).toBe(true);
  });

  it('cancels pending show timer when hide is invoked early', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
      delayMs: 300,
    });
    const service = createMockService();
    const { isVisible, show, hide } = useShortcutTooltip(props, service);

    show();
    vi.advanceTimersByTime(150);
    hide();

    vi.advanceTimersByTime(300);
    expect(isVisible.value).toBe(false);
  });

  it('does not show when disabled is true', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
      disabled: true,
      delayMs: 0,
    });
    const service = createMockService();
    const { isVisible, show } = useShortcutTooltip(props, service);

    show();
    expect(isVisible.value).toBe(false);
  });

  it('does not show when both label and shortcutKey are empty', () => {
    const props = reactive<ShortcutTooltipProps>({
      delayMs: 0,
    });
    const service = createMockService('', '');
    const { isVisible, show } = useShortcutTooltip(props, service);

    show();
    expect(isVisible.value).toBe(false);
  });

  it('clears active timer when component unmounts', () => {
    const service = createMockService();
    const TestComponent = defineComponent({
      props: {
        shortcutId: { type: String, default: 'send-request' },
        delayMs: { type: Number, default: 300 },
      },
      setup(props) {
        return { ...useShortcutTooltip(props, service) };
      },
      template: '<div />',
    });

    const wrapper = mount(TestComponent);
    wrapper.vm.show();
    expect(wrapper.vm.isVisible).toBe(false);

    wrapper.unmount();
    vi.advanceTimersByTime(500);
  });
});

