import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CodeEditor from '../index.vue';

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
});
