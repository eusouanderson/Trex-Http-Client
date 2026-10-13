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
    await tokenInput.setValue('typed-bearer-token');

    const toggleButton = wrapper.find('button');
    await toggleButton.trigger('click');

    const visibleInput = wrapper.find('input[type="text"][placeholder*="access_token"]');
    expect(visibleInput.exists()).toBe(true);
    await visibleInput.setValue('visible-typed-token');
    expect(wrapper.emitted('update:modelValue')).toBeDefined();
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

  it('should render inherit state correctly', () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'inherit' },
      },
    });

    expect(wrapper.text()).toContain('Herdando configurações de autenticação');
  });

  it('should render and interact with basic auth form', async () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'basic', username: 'admin', password: 'secretpassword', enabled: true },
      },
    });

    expect(wrapper.text()).toContain('Usuário:');
    expect(wrapper.text()).toContain('Senha:');

    const usernameInput = wrapper.find('input[placeholder*="username"]');
    await usernameInput.setValue('new-admin');

    const toggleBtn = wrapper.find('button');
    await toggleBtn.trigger('click');

    const passwordInput = wrapper.find('input[placeholder*="password"]');
    await passwordInput.setValue('new-pass');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('should render and interact with apiKey form', async () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'apiKey', key: 'X-API-KEY', value: 'secretkey', addTo: 'header', enabled: true },
      },
    });

    expect(wrapper.text()).toContain('Nome da Chave:');

    const keyInput = wrapper.find('input[placeholder*="X-API-Key"]');
    await keyInput.setValue('X-Custom-Key');

    const select = wrapper.findAll('select')[1];
    if (select) {
      await select.setValue('query');
    }

    const toggleBtn = wrapper.find('button');
    await toggleBtn.trigger('click');

    const valInput = wrapper.find('input[placeholder*="api_key"]');
    await valInput.setValue('key-val');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('should render and interact with oauth2 form', async () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: {
          type: 'oauth2',
          grantType: 'client_credentials',
          tokenUrl: 'https://oauth.com/token',
          clientId: 'cid',
          accessToken: 'tok',
          enabled: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Grant Type:');

    const grantSelect = wrapper.findAll('select')[1];
    if (grantSelect) {
      await grantSelect.setValue('authorization_code');
    }

    const tokenUrlInput = wrapper.find('input[placeholder*="oauth/token"]');
    await tokenUrlInput.setValue('https://auth.com/token');

    const clientIdInput = wrapper.find('input[placeholder*="client-id"]');
    await clientIdInput.setValue('my-client');

    const tokenInput = wrapper.find('input[placeholder*="access_token"]');
    await tokenInput.setValue('my-token');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('should update bearer prefix input', async () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'bearer', token: 'token123', prefix: 'Bearer', enabled: true },
      },
    });

    const prefixInput = wrapper.find('input[placeholder="Bearer"]');
    await prefixInput.setValue('Token');
    expect(wrapper.emitted('update:modelValue')).toBeDefined();
  });

  it('should reactively update when modelValue prop changes', async () => {
    const wrapper = mount(AuthEditor, {
      props: {
        modelValue: { type: 'none' },
      },
    });

    expect(wrapper.text()).toContain('Nenhum cabeçalho ou parâmetro de autenticação');

    await wrapper.setProps({
      modelValue: { type: 'bearer', token: 'dynamic-token', prefix: 'Bearer', enabled: true },
    });

    expect(wrapper.text()).toContain('Prefixo:');
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);

    await wrapper.setProps({
      modelValue: undefined,
    });
    expect(wrapper.text()).toContain('Nenhum cabeçalho ou parâmetro de autenticação');
  });
});

