import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { computed } from 'vue';
import CodeEditor from '../index.vue';
import type * as VueUseCore from '@vueuse/core';

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof VueUseCore>();
  return {
    ...actual,
    useClipboard: vi.fn(() => ({
      copy: vi.fn(),
      copied: computed(() => false),
    })),
  };
});

import { useClipboard } from '@vueuse/core';

import type * as vueuse from '@vueuse/core';

vi.mock('@vueuse/core', async (importOriginal) => {
  const original = await importOriginal<typeof vueuse>();
  const mockedCopied = ref(false);
  return {
    ...original,
    useClipboard: () => ({
      copy: vi.fn().mockImplementation(() => {
        mockedCopied.value = true;
      }),
      copied: mockedCopied,
    }),
  };
});
describe('CodeEditor Component', () => {
  let wrapper: ReturnType<typeof mount> | undefined;

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
        toJSON: (): Record<string, number> => ({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        }),
      });
    }
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.mocked(useClipboard).mockClear();
  });

  it('should mount CodeEditor component properly', () => {
    wrapper = mount(CodeEditor, {
      props: {
        modelValue: '{"hello": "world"}',
        readOnly: false,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('should show a large transparent Trex watermark when the editor is empty', () => {
    wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        readOnly: false,
      },
    });

    const watermark = wrapper.find('img[alt="T-Rex"]');
    expect(watermark.attributes('src')).toBe('/logos/Trex.png');
  });

  it('should hide the Trex watermark when the editor contains code', () => {
    wrapper = mount(CodeEditor, {
      props: {
        modelValue: '{"hello":"world"}',
        readOnly: false,
      },
    });

    expect(wrapper.find('img[alt="T-Rex"]').exists()).toBe(false);
  });

  it('should render search button and handle click', async () => {
    wrapper = mount(CodeEditor, {
      props: {
        modelValue: '{"hello": "world"}',
        readOnly: false,
      },
    });

    const searchBtn = wrapper.find('button[title*="Buscar"]');
    expect(searchBtn.exists()).toBe(true);
    await searchBtn.trigger('click');
  });

  it('should not render search button when showSearch prop is false', () => {
    wrapper = mount(CodeEditor, {
      props: {
        modelValue: '{}',
        showSearch: false,
      },
    });

    const searchBtn = wrapper.find('button[title*="Buscar"]');
    expect(searchBtn.exists()).toBe(false);
  });

  it('should render copy button and handle click', async () => {
    wrapper = mount(CodeEditor, {
      props: {
        modelValue: '{"hello": "world"}',
        readOnly: false,
        showCopy: true,
      },
    });

    const copyBtn = wrapper.find('button[title*="Copiar"]');
    expect(copyBtn.exists()).toBe(true);
    await copyBtn.trigger('click');
  });

  it('should not render copy button when showCopy prop is false', () => {
    wrapper = mount(CodeEditor, {
      props: {
        modelValue: '{}',
        showCopy: false,
      },
    });

    const copyBtn = wrapper.find('button[title*="Copiar"]');
    expect(copyBtn.exists()).toBe(false);
  });

  it('should render copied state properly', () => {
    vi.mocked(useClipboard).mockReturnValueOnce({
      copy: vi.fn(),
      copied: computed(() => true),
      isSupported: computed(() => true),
      text: computed(() => ''),
    });

    wrapper = mount(CodeEditor, {
      props: {
        modelValue: 'code',
        showCopy: true,
      },
    });

    const copyBtn = wrapper.find('button[title="Copiado!"]');
    expect(copyBtn.exists()).toBe(true);
    expect(copyBtn.text()).toContain('Copiado');
  });
});
