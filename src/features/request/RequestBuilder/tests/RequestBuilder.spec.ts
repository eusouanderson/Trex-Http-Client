import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { useRequest } from '../../use-request';
import RequestBuilder from '../index.vue';

describe('RequestBuilder Component', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, statusText: 'OK' }),
    );
    const { createTab } = useRequest();
    createTab();
  });

  it('should render request builder and allow method and url editing', async () => {
    const wrapper = mount(RequestBuilder);
    expect(wrapper.exists()).toBe(true);

    const select = wrapper.find('select');
    await select.setValue('POST');
    expect(wrapper.find('select').element.value).toBe('POST');

    const input = wrapper.find('input[type="text"]');
    await input.setValue('https://api.dinossauro.dev/fossils');
    await input.trigger('keydown.enter');
  });

  it('should switch between categories and manage parameters and headers', async () => {
    const wrapper = mount(RequestBuilder);

    const headersBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Headers'));
    expect(headersBtn).toBeDefined();
    await headersBtn?.trigger('click');
    expect(wrapper.text()).toContain('Nenhum header configurado.');

    const addHeaderBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('+ Adicionar Header'));
    await addHeaderBtn?.trigger('click');

    const removeHeaderBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('✕'));
    await removeHeaderBtn?.trigger('click');
    expect(wrapper.text()).toContain('Nenhum header configurado.');

    const paramsBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Parâmetros'));
    expect(paramsBtn).toBeDefined();
    await paramsBtn?.trigger('click');
    expect(wrapper.text()).toContain('Nenhum query parameter adicionado.');

    const addParamBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('+ Adicionar Parâmetro'));
    await addParamBtn?.trigger('click');

    const removeParamBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('✕'));
    await removeParamBtn?.trigger('click');
    expect(wrapper.text()).toContain('Nenhum query parameter adicionado.');
  });

  it('should switch to body tab and select body type via radios and format json', async () => {
    const wrapper = mount(RequestBuilder);

    const bodyBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Corpo'));
    expect(bodyBtn).toBeDefined();
    await bodyBtn?.trigger('click');

    const textRadio = wrapper.find('input[type="radio"][value="text"]');
    await textRadio.trigger('change');

    const noneRadio = wrapper.find('input[type="radio"][value="none"]');
    await noneRadio.trigger('change');

    const jsonRadio = wrapper.find('input[type="radio"][value="json"]');
    await jsonRadio.trigger('change');

    const formatBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Formatar'));
    await formatBtn?.trigger('click');

    const sendBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Enviar'));
    await sendBtn?.trigger('click');
    await flushPromises();
    expect(wrapper.emitted('sent')).toBeDefined();
  });

  it('should support all http method select options and body updates', async () => {
    const wrapper = mount(RequestBuilder);
    const select = wrapper.find('select');

    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    for (const method of methods) {
      await select.setValue(method);
      expect(select.element.value).toBe(method);
    }
  });

  it('should display empty message when activeTab is not present', () => {
    const { tabs, closeTab } = useRequest();
    while (tabs.value.length > 0) {
      const tab = tabs.value[0];
      if (!tab) break;
      closeTab(tab.id);
    }

    const wrapper = mount(RequestBuilder);
    expect(wrapper.text()).toContain('Nenhuma requisição aberta');
  });
});
