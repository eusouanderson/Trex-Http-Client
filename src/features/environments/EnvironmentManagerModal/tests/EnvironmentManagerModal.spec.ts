import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useEnvironments } from '../../use-environments';
import EnvironmentManagerModal from '../index.vue';

describe('EnvironmentManagerModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
    const { environments, deleteEnvironment, setActiveEnvironment } = useEnvironments();
    [...environments.value].forEach((env) => {
      deleteEnvironment(env.id);
    });
    setActiveEnvironment(null);
  });

  it('should not render anything when isOpen is false', () => {
    const wrapper = mount(EnvironmentManagerModal, {
      props: {
        isOpen: false,
      },
    });

    expect(wrapper.find('div.fixed').exists()).toBe(false);
  });

  it('should render modal content when isOpen is true and handle close button', async () => {
    const wrapper = mount(EnvironmentManagerModal, {
      props: {
        isOpen: true,
      },
    });

    expect(wrapper.find('h2').text()).toContain('Gerenciar Ambientes');
    const closeBtn = wrapper.find('button.w-8.h-8');
    await closeBtn.trigger('click');

    expect(wrapper.emitted('close')).toBeDefined();

    const backdrop = wrapper.find('div.fixed');
    await backdrop.trigger('click');
  });

  it('should handle creating, editing, and deleting an environment with variables', async () => {
    const wrapper = mount(EnvironmentManagerModal, {
      props: {
        isOpen: true,
      },
    });

    expect(wrapper.text()).toContain('Nenhum ambiente criado.');

    const newEnvBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('+ Novo Ambiente'));
    expect(newEnvBtn).toBeDefined();
    await newEnvBtn?.trigger('click');
    await newEnvBtn?.trigger('click');

    const envItemButtons = wrapper
      .findAll('button')
      .filter((b) => b.text().includes('Ambiente 1'));
    if (envItemButtons[0]) {
      await envItemButtons[0].trigger('click');
    }

    expect(wrapper.text()).toContain('Ambiente 1');

    const nameInput = wrapper.find('input[placeholder="Nome do Ambiente"]');
    expect(nameInput.exists()).toBe(true);
    await nameInput.setValue('Produção Oficial');

    const addVarBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('+ Adicionar Variável'));
    expect(addVarBtn).toBeDefined();
    await addVarBtn?.trigger('click');

    const keyInput = wrapper.find('input[placeholder="minha_variavel"]');
    expect(keyInput.exists()).toBe(true);
    await keyInput.setValue('api_key');

    const valInput = wrapper.find('input[placeholder="valor..."]');
    expect(valInput.exists()).toBe(true);
    await valInput.setValue('segredo_123');

    const toggleEyeBtn = wrapper.find('button[title*="valor"]');
    expect(toggleEyeBtn.exists()).toBe(true);
    await toggleEyeBtn.trigger('click');
    expect(valInput.attributes('type')).toBe('text');
    await toggleEyeBtn.trigger('click');
    expect(valInput.attributes('type')).toBe('password');

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(false);

    const setActiveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Definir como Ativo'));
    expect(setActiveBtn).toBeDefined();
    await setActiveBtn?.trigger('click');
    expect(wrapper.text()).toContain('✓ Ativo');

    const removeVarBtn = wrapper.find('div.col-span-1 button');
    expect(removeVarBtn.exists()).toBe(true);
    await removeVarBtn.trigger('click');
    expect(wrapper.text()).toContain('Nenhuma variável neste ambiente.');

    const deleteEnvBtn = wrapper.find('span.text-magma-400');
    expect(deleteEnvBtn.exists()).toBe(true);
    await deleteEnvBtn.trigger('click');

    const secondDeleteBtn = wrapper.find('span.text-magma-400');
    if (secondDeleteBtn.exists()) {
      await secondDeleteBtn.trigger('click');
    }
    expect(wrapper.text()).toContain('Nenhum ambiente criado.');
  });
});
