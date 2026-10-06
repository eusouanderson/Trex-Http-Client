import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ResponseViewer } from '../../index';
import { useResponseViewer } from '../use-response-viewer';

describe('ResponseViewer Component', () => {
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

  beforeEach(() => {
    const { setTab } = useResponseViewer();
    setTab('body');
  });

  it('should render loading state when loading prop is true', () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: true,
        result: null,
      },
    });

    expect(wrapper.text()).toContain('Aguardando resposta do T-Rex...');
  });

  it('should render empty state when result is null and loading is false', () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        result: null,
      },
    });

    expect(wrapper.text()).toContain('Pronto para disparar');
  });

  it('should render response details and switch between body and headers tabs', async () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        result: {
          status: 200,
          statusText: 'OK',
          durationMs: 45,
          sizeBytes: 128,
          headers: {
            'content-type': 'application/json',
            'x-api-version': '1.0',
          },
          data: { dino: 'Stegosaurus' },
        },
      },
    });

    expect(wrapper.text()).toContain('200 OK');
    expect(wrapper.text()).toContain('45 ms');
    expect(wrapper.text()).toContain('Stegosaurus');

    const headersBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Headers'));
    expect(headersBtn).toBeDefined();
    await headersBtn?.trigger('click');

    expect(wrapper.text()).toContain('content-type');
    expect(wrapper.text()).toContain('application/json');

    const bodyBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Corpo'));
    expect(bodyBtn).toBeDefined();
    await bodyBtn?.trigger('click');
  });

  it('should display error message when result has error and handle empty headers', async () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        result: {
          status: 0,
          statusText: 'Error',
          durationMs: 10,
          sizeBytes: 0,
          headers: {},
          data: null,
          error: 'Falha na conexão',
        },
      },
    });

    expect(wrapper.text()).toContain('Erro na Requisição');
    expect(wrapper.text()).toContain('Falha na conexão');

    const headersBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Headers'));
    await headersBtn?.trigger('click');

    expect(wrapper.text()).toContain('Nenhum header retornado pela resposta.');
  });
});
