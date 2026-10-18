import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ContextMenuItem, ContextMenuProps } from '../interfaces';
import ContextMenu from '../index.vue';
import { useContextMenu } from '../use-context-menu';

describe('useContextMenu', () => {
  const defaultProps: ContextMenuProps = {
    isOpen: true,
    x: 100,
    y: 150,
    items: [],
  };

  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should compute initial position style within bounds', () => {
    const emit = vi.fn();
    const { menuStyle } = useContextMenu(defaultProps, emit);

    expect(menuStyle.value).toEqual({
      top: '150px',
      left: '100px',
    });
  });

  it('should adjust position if near bottom or right viewport edge', () => {
    const emit = vi.fn();
    const { menuStyle } = useContextMenu(
      {
        ...defaultProps,
        x: 950,
        y: 700,
      },
      emit,
    );

    expect(menuStyle.value.top).toBeDefined();
    expect(menuStyle.value.left).toBeDefined();
  });

  it('should handle item selection when item is not disabled', () => {
    let actionCalled = false;
    const item: ContextMenuItem = {
      id: 'opt-1',
      label: 'Option 1',
      action: () => {
        actionCalled = true;
      },
    };

    const emit = vi.fn();
    const { handleSelect } = useContextMenu(defaultProps, emit);

    handleSelect(item);
    expect(actionCalled).toBe(true);
    expect(emit).toHaveBeenCalledWith('select', item);
    expect(emit).toHaveBeenCalledWith('close');
  });

  it('should not execute action or emit events when item is disabled', () => {
    let actionCalled = false;
    const item: ContextMenuItem = {
      id: 'opt-disabled',
      label: 'Disabled Option',
      disabled: true,
      action: () => {
        actionCalled = true;
      },
    };

    const emit = vi.fn();
    const { handleSelect } = useContextMenu(defaultProps, emit);

    handleSelect(item);
    expect(actionCalled).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });

  it('should close when Escape key is pressed', () => {
    const wrapper = mount(ContextMenu, {
      props: defaultProps,
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.unmount();
  });

  it('should ignore non-Escape keydown events', () => {
    const wrapper = mount(ContextMenu, {
      props: defaultProps,
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(wrapper.emitted('close')).toBeUndefined();
    wrapper.unmount();
  });

  it('should close on mousedown outside menu', () => {
    const wrapper = mount(ContextMenu, {
      props: defaultProps,
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.unmount();
  });

  it('should not close on mousedown inside menu', () => {
    const wrapper = mount(ContextMenu, {
      props: defaultProps,
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const menuEl = wrapper.find('div').element;
    menuEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(wrapper.emitted('close')).toBeUndefined();

    wrapper.unmount();
  });

  it('should not trigger close if isOpen is false', () => {
    const wrapper = mount(ContextMenu, {
      props: {
        isOpen: false,
        x: 100,
        y: 100,
        items: [],
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(wrapper.emitted('close')).toBeUndefined();
    wrapper.unmount();
  });
});
