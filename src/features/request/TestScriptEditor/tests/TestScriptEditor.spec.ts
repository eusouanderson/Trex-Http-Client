import { describe, expect, it, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import TestScriptEditor from '../index.vue';

describe('TestScriptEditor Component', () => {
  beforeAll(() => {
    if (typeof Range.prototype.getClientRects === 'undefined') {
      Range.prototype.getClientRects = (): DOMRectList => [] as unknown as DOMRectList;
      Range.prototype.getBoundingClientRect = (): DOMRect => ({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: (): Record<string, number> => ({}),
      });
    }
  });

  it('deve renderizar os snippets e o editor', () => {
    const wrapper = mount(TestScriptEditor, {
      props: {
        modelValue: 'pm.test("Status", () => {});',
      },
    });

    expect(wrapper.text()).toContain('Snippets Rápidos');
    expect(wrapper.text()).toContain('Status: 200 OK');
    expect(wrapper.text()).toContain('Validar JSON');
    expect(wrapper.text()).toContain('Salvar Variável de Ambiente');
  });

  it('deve emitir update:modelValue ao clicar em um snippet', async () => {
    const wrapper = mount(TestScriptEditor, {
      props: {
        modelValue: '',
      },
    });

    const snippetBtn = wrapper.findAll('button[type="button"]').find((b) => b.text().includes('Status: 200 OK'));
    expect(snippetBtn).toBeDefined();
    await snippetBtn?.trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeDefined();
    expect(emitted?.[0]?.[0]).toContain('tx.test("Status deve ser 200"');
  });
});

