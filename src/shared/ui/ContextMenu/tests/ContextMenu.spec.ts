import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContextMenu from '../index.vue';
import type { ContextMenuItem } from '../interfaces';

describe('ContextMenu Component', () => {
  it('should render items when isOpen is true', async () => {
    const action1 = vi.fn();
    const action2 = vi.fn();

    const items: ContextMenuItem[] = [
      { id: '1', label: 'Item 1', icon: '🚀', action: action1 },
      { id: '2', label: 'Item 2', divider: true, danger: true, action: action2 },
      { id: '3', label: 'Item 3 (Disabled)', disabled: true, action: vi.fn() },
    ];

    const wrapper = mount(ContextMenu, {
      props: {
        isOpen: true,
        x: 150,
        y: 200,
        items,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]?.text()).toContain('Item 1');
    expect(buttons[0]?.text()).toContain('🚀');
    expect(buttons[1]?.text()).toContain('Item 2');
    expect(buttons[2]?.attributes('disabled')).toBeDefined();

    await buttons[0]?.trigger('click');
    expect(action1).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('should not render anything when isOpen is false', () => {
    const wrapper = mount(ContextMenu, {
      props: {
        isOpen: false,
        x: 100,
        y: 100,
        items: [],
      },
    });

    expect(wrapper.find('button').exists()).toBe(false);
  });
});
