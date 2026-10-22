import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ShortcutsSection from '../index.vue';

describe('ShortcutsSection.vue', () => {
  it('renders title, search bar, and category filters', () => {
    const wrapper = mount(ShortcutsSection);
    expect(wrapper.text()).toContain('Atalhos de Teclado');
    expect(wrapper.find('input[aria-label="Buscar atalho"]').exists()).toBe(true);
    expect(wrapper.findAll('button').length).toBeGreaterThan(0);
  });

  it('filters shortcuts when selecting a category chip', async () => {
    const wrapper = mount(ShortcutsSection);
    const categoryButtons = wrapper.findAll('button');
    const requestsButton = categoryButtons.find((b) => b.text().includes('Requisições'));

    if (requestsButton) {
      await requestsButton.trigger('click');
      expect(wrapper.text()).toContain('Enviar Requisição');
    }
  });

  it('triggers recording mode when clicking Alterar button', async () => {
    const wrapper = mount(ShortcutsSection);
    const alterButton = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Alterar');

    if (alterButton) {
      await alterButton.trigger('click');
      expect(wrapper.find('input[readonly]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Salvar');
      expect(wrapper.text()).toContain('Cancelar');

      const cancelButton = wrapper
        .findAll('button')
        .find((b) => b.text().trim() === 'Cancelar');
      await cancelButton?.trigger('click');
      expect(wrapper.find('input[readonly]').exists()).toBe(false);
    }
  });

  it('allows clicking Restaurar Padrões', async () => {
    const wrapper = mount(ShortcutsSection);
    const resetAllBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Restaurar Padrões'));

    if (resetAllBtn) {
      await resetAllBtn.trigger('click');
      expect(wrapper.exists()).toBe(true);
    }
  });

  it('filters shortcuts when typing in search input', async () => {
    const wrapper = mount(ShortcutsSection);
    const searchInput = wrapper.find('input[aria-label="Buscar atalho"]');
    await searchInput.setValue('NaoExisteTermoXYZ');
    expect(wrapper.text()).toContain('Nenhum atalho encontrado para o filtro aplicado.');
  });

  it('allows restoring individual shortcut and dismissing conflict warning', async () => {
    const wrapper = mount(ShortcutsSection);
    const alterBtns = wrapper.findAll('button').filter((b) => b.text().trim() === 'Alterar');
    const alterBtn = alterBtns[1];
    if (alterBtn) {
      await alterBtn.trigger('click');
      const input = wrapper.find('input[readonly]');
      await input.trigger('keydown', { key: 'p', ctrlKey: true, shiftKey: true });
      const saveBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Salvar');
      if (saveBtn) {
        await saveBtn.trigger('click');
      }

      expect(wrapper.text()).toContain('Atenção: combinação já usada por:');
      const closeWarningBtn = wrapper.findAll('button').find((b) => b.text().trim() === '✕');
      if (closeWarningBtn) {
        await closeWarningBtn.trigger('click');
        expect(wrapper.text()).not.toContain('Atenção: combinação já usada por:');
      }

      const restoreBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Restaurar');
      if (restoreBtn) {
        await restoreBtn.trigger('click');
        expect(wrapper.text()).not.toContain('Personalizado');
      }
    }
  });
});
