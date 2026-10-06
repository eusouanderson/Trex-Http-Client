import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useEnvironments } from '../../use-environments';
import EnvironmentSelector from '../index.vue';

describe('EnvironmentSelector Component', () => {
  beforeEach(() => {
    localStorage.clear();
    const { environments, createEnvironment, deleteEnvironment, setActiveEnvironment } = useEnvironments();
    [...environments.value].forEach((env) => {
      deleteEnvironment(env.id);
    });
    setActiveEnvironment(null);
    createEnvironment('Dev Env');
  });

  it('should render selector with options and emit openManager when manage option selected', async () => {
    const wrapper = mount(EnvironmentSelector);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Sem Ambiente');
    expect(wrapper.text()).toContain('Dev Env');

    const select = wrapper.find('select');
    await select.setValue('manage');

    expect(wrapper.emitted('openManager')).toBeDefined();
  });

  it('should emit openManager when clicking the globe button', async () => {
    const wrapper = mount(EnvironmentSelector);
    const globeButton = wrapper.find('button[title*="Gerenciar Ambientes"]');
    expect(globeButton.exists()).toBe(true);

    await globeButton.trigger('click');
    expect(wrapper.emitted('openManager')).toBeDefined();
  });

  it('should change active environment when an environment option is selected', async () => {
    const { environments, activeEnvironment } = useEnvironments();
    const envId = environments.value[0]?.id ?? '';

    const wrapper = mount(EnvironmentSelector);
    const select = wrapper.find('select');
    await select.setValue(envId);

    expect(activeEnvironment.value?.id).toBe(envId);

    await select.setValue('none');
    expect(activeEnvironment.value).toBeNull();
  });

  it('should reset select value to active environment id when manage is clicked and activeEnv exists', async () => {
    const { environments, setActiveEnvironment } = useEnvironments();
    const envId = environments.value[0]?.id ?? '';
    setActiveEnvironment(envId);

    const wrapper = mount(EnvironmentSelector);
    const select = wrapper.find('select');
    await select.setValue('manage');

    expect(wrapper.emitted('openManager')).toBeDefined();
    expect((select.element as HTMLSelectElement).value).toBe(envId);
  });
});
