import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import {
  ShortcutTooltip,
  ShortcutTooltipService,
  shortcutTooltipService,
  useShortcutTooltip,
} from '../index';
import { shortcutRegistryService } from '../../../../core/shortcuts';

describe('ShortcutTooltip component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    shortcutRegistryService.register({
      id: 'test-button-shortcut',
      name: 'Executar Botão',
      description: 'Executa a ação do botão',
      category: 'general',
      defaultKeyCombo: 'ctrl+b',
      action: vi.fn(),
    });
    shortcutRegistryService.register({
      id: 'empty-name-shortcut',
      name: '',
      description: '',
      category: 'general',
      defaultKeyCombo: 'ctrl+e',
      action: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    shortcutRegistryService.unregister('test-button-shortcut');
    shortcutRegistryService.unregister('empty-name-shortcut');
  });

  const mountTooltip = (
    props: Record<string, unknown> = {},
    slots: Record<string, string> = { default: '<button id="btn">Click</button>' },
  ): ReturnType<typeof mount> => {
    return mount(ShortcutTooltip, {
      props,
      slots,
      global: {
        stubs: {
          teleport: true,
        },
      },
    });
  };

  it('exports public API items properly from index', () => {
    expect(ShortcutTooltip).toBeDefined();
    expect(ShortcutTooltipService).toBeDefined();
    expect(shortcutTooltipService).toBeDefined();
    expect(useShortcutTooltip).toBeDefined();
  });

  it('renders slot content correctly', () => {
    const wrapper = mountTooltip(
      { shortcutId: 'test-button-shortcut' },
      { default: '<button id="my-btn">Meu Botão</button>' },
    );

    expect(wrapper.find('#my-btn').exists()).toBe(true);
    expect(wrapper.find('#my-btn').text()).toBe('Meu Botão');
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
  });

  it('shows tooltip on mouseenter and hides on mouseleave with default delay', async () => {
    const wrapper = mountTooltip(
      { shortcutId: 'test-button-shortcut' },
      { default: '<button>Hover Me</button>' },
    );

    await wrapper.trigger('mouseenter');
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);

    vi.advanceTimersByTime(300);
    await wrapper.vm.$nextTick();

    const tooltip = wrapper.find('[role="tooltip"]');
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toBe('Ctrl + B');
    expect(tooltip.find('kbd').exists()).toBe(true);

    await wrapper.trigger('mouseleave');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
  });

  it('shows tooltip immediately on focusin when delayMs is 0 and hides on focusout', async () => {
    const wrapper = mountTooltip(
      {
        shortcutId: 'test-button-shortcut',
        delayMs: 0,
      },
      { default: '<button>Focus Me</button>' },
    );

    await wrapper.trigger('focusin');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true);

    await wrapper.trigger('focusout');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
  });

  it('does not display tooltip when disabled prop is true', async () => {
    const wrapper = mountTooltip(
      {
        shortcutId: 'test-button-shortcut',
        disabled: true,
        delayMs: 0,
      },
      { default: '<button>Disabled Tooltip</button>' },
    );

    await wrapper.trigger('mouseenter');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
  });

  it('applies custom position style for bottom position', async () => {
    const wrapper = mountTooltip(
      {
        shortcutId: 'test-button-shortcut',
        position: 'bottom',
        delayMs: 0,
      },
      { default: '<button>Bottom</button>' },
    );

    await wrapper.trigger('mouseenter');
    await wrapper.vm.$nextTick();

    const tooltip = wrapper.find('[role="tooltip"]');
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.attributes('style')).toContain('translate(-50%, 0)');
  });

  it('renders text label without kbd when shortcutId is not provided', async () => {
    const wrapper = mountTooltip(
      {
        text: 'Apenas Ajuda',
        delayMs: 0,
      },
      { default: '<button>Text Only</button>' },
    );

    await wrapper.trigger('mouseenter');
    await wrapper.vm.$nextTick();

    const tooltip = wrapper.find('[role="tooltip"]');
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toBe('Apenas Ajuda');
    expect(tooltip.find('kbd').exists()).toBe(false);
  });

  it('renders kbd without label when shortcut name is empty', async () => {
    const wrapper = mountTooltip(
      {
        shortcutId: 'empty-name-shortcut',
        delayMs: 0,
      },
      { default: '<button>Kbd Only</button>' },
    );

    await wrapper.trigger('mouseenter');
    await wrapper.vm.$nextTick();

    const tooltip = wrapper.find('[role="tooltip"]');
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.find('span').exists()).toBe(false);
    expect(tooltip.find('kbd').exists()).toBe(true);
  });

  it('renders both custom text label and shortcut kbd when both are provided', async () => {
    const wrapper = mountTooltip(
      {
        shortcutId: 'test-button-shortcut',
        text: 'Custom',
        delayMs: 0,
      },
      { default: '<button>Custom</button>' },
    );

    await wrapper.trigger('mouseenter');
    await wrapper.vm.$nextTick();

    const tooltip = wrapper.find('[role="tooltip"]');
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.find('span').text()).toBe('Custom');
    expect(tooltip.find('kbd').text()).toBe('Ctrl + B');
  });
});
