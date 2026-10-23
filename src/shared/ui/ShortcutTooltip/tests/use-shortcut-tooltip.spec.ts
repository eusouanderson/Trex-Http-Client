import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import type {
  IShortcutTooltipService,
  ShortcutTooltipProps,
  TooltipPositionStyle,
} from '../interfaces';
import { useShortcutTooltip } from '../use-shortcut-tooltip';

describe('useShortcutTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const mockStyle: TooltipPositionStyle = {
    top: '94px',
    left: '230px',
    transform: 'translate(-50%, -100%)',
  };

  const createMockService = (
    label = 'Enviar Requisição',
    shortcutKey = 'Ctrl + Enter',
    tooltipStyle: TooltipPositionStyle = mockStyle,
  ): IShortcutTooltipService => {
    return {
      calculateTooltipStyle: () => tooltipStyle,
      resolveTooltipContent: () => ({ label, shortcutKey }),
    };
  };

  const TestComponent = defineComponent({
    props: {
      shortcutId: { type: String, default: 'send-request' },
      delayMs: { type: Number, default: 0 },
    },
    setup(props) {
      return { ...useShortcutTooltip(props, createMockService()) };
    },
    template: '<div ref="triggerRef"><button>Trigger</button></div>',
  });

  it('initializes with hidden state and computes values from service', () => {
    const props = reactive<ShortcutTooltipProps>({
      shortcutId: 'send-request',
      position: 'top',
    });
    const service = createMockService();
    const { isVisible, label, shortcutKey, tooltipStyle, triggerRef } =
      useShortcutTooltip(props, service);

    expect(isVisible.value).toBe(false);
    expect(label.value).toBe('Enviar Requisição');
    expect(shortcutKey.value).toBe('Ctrl + Enter');
    expect(tooltipStyle.value).toEqual(mockStyle);
    expect(triggerRef.value).toBeNull();
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

  it('updates position and handles window scroll and resize in mounted component', () => {
    const wrapper = mount(TestComponent, { attachTo: document.body });
    const triggerEl = wrapper.element as HTMLElement;
    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      bottom: 80,
      left: 100,
      right: 150,
      width: 50,
      height: 30,
      x: 100,
      y: 50,
      toJSON: vi.fn(),
    });

    wrapper.vm.show();
    expect(wrapper.vm.isVisible).toBe(true);

    window.dispatchEvent(new Event('scroll'));
    expect(wrapper.vm.isVisible).toBe(false);

    window.dispatchEvent(new Event('resize'));
    expect(wrapper.vm.isVisible).toBe(false);

    wrapper.vm.show();
    expect(wrapper.vm.isVisible).toBe(true);
    window.dispatchEvent(new Event('resize'));
    expect(wrapper.vm.isVisible).toBe(false);

    wrapper.unmount();
  });

  it('clears active timer when component unmounts', () => {
    const wrapper = mount(TestComponent, {
      props: {
        delayMs: 300,
      },
    });

    wrapper.vm.show();
    expect(wrapper.vm.isVisible).toBe(false);

    wrapper.unmount();
    vi.advanceTimersByTime(500);
  });
});
