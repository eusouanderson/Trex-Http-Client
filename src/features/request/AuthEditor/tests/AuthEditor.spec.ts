import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthEditor from '../index.vue';
import type { BearerAuthConfig } from '../../../../core/security/interfaces';

describe('AuthEditor Component', () => {
  it('should render auth type selector and default No Auth state', () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'none' },
      },
    });

    expect(wrapper.text()).toContain('Tipo de Auth:');
    expect(wrapper.text()).toContain('Nenhum cabeçalho ou parâmetro de autenticação');
  });

  it('should render Bearer inputs and toggle token visibility', async () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'bearer', token: 'secret-token', prefix: 'Bearer', enabled: true },
      },
    });

    const tokenInput = wrapper.find('input[type="password"]');
    expect(tokenInput.exists()).toBe(true);
    expect((tokenInput.element as HTMLInputElement).value).toBe('secret-token');

    const toggleButton = wrapper.find('button');
    await toggleButton.trigger('click');

    const visibleInput = wrapper.find('input[type="text"][placeholder*="access_token"]');
    expect(visibleInput.exists()).toBe(true);
  });

  it('should emit update:modelValue when changing auth type from dropdown', async () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'none' },
      },
    });

    const select = wrapper.find('select');
    await select.setValue('bearer');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeDefined();
    expect((emitted?.[0]?.[0] as BearerAuthConfig).type).toBe('bearer');
  });
});

