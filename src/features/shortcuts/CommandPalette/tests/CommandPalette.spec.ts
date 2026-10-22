import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CommandPalette from '../index.vue';

describe('CommandPalette.vue', () => {
  it('does not render modal content when isOpen is false', () => {
    const wrapper = mount(CommandPalette, {
      props: { isOpen: false },
    });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('renders search input and commands list when isOpen is true', () => {
    const wrapper = mount(CommandPalette, {
      props: { isOpen: true },
    });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Buscar comando"]').exists()).toBe(true);
    expect(wrapper.findAll('button').length).toBeGreaterThan(0);
  });

  it('emits close when clicking backdrop', async () => {
    const wrapper = mount(CommandPalette, {
      props: { isOpen: true },
    });
    await wrapper.find('[role="dialog"]').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('executes command when clicking an item', async () => {
    const wrapper = mount(CommandPalette, {
      props: { isOpen: true },
    });
    const firstButton = wrapper.findAll('button')[0];
    if (firstButton) {
      await firstButton.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    }
  });

  it('updates search query via input and displays empty state', async () => {
    const wrapper = mount(CommandPalette, {
      props: { isOpen: true },
    });
    const input = wrapper.find('input[aria-label="Buscar comando"]');
    await input.setValue('termo-inexistente-xyz');
    expect(wrapper.text()).toContain('Nenhum comando correspondente encontrado');
  });

  it('handles keydown on search input', async () => {
    const wrapper = mount(CommandPalette, {
      props: { isOpen: true },
    });
    const input = wrapper.find('input[aria-label="Buscar comando"]');
    await input.trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
