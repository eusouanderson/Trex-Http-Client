import { mount } from '@vue/test-utils';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
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
    expect(wrapper.find('img[alt="T-Rex"]').attributes('src')).toContain('/logos/Trex.png');
  });

  it('should render empty state when result is null and loading is false', () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        result: null,
      },
    });

    expect(wrapper.text()).toContain('Pronto para disparar');
    expect(wrapper.find('img[alt="T-Rex"]').attributes('src')).toContain('/logos/Trex.png');
    expect(wrapper.find('img[alt="T-Rex"]').classes()).toContain('w-16');
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

  it('should switch to tests tab and display test results report', async () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        result: {
          status: 200,
          statusText: 'OK',
          durationMs: 45,
          sizeBytes: 120,
          headers: {},
          data: { success: true },
          testResults: {
            results: [
              { name: 'Status é 200', passed: true, durationMs: 2 },
            ],
            environmentMutations: [],
            totalPassed: 1,
            totalFailed: 0,
            durationMs: 2,
          },
        },
      },
    });

    expect(wrapper.text()).toContain('1/1');
    const testsBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Testes'));
    expect(testsBtn).toBeDefined();
    await testsBtn?.trigger('click');

    expect(wrapper.text()).toContain('Status é 200');
    expect(wrapper.text()).toContain('PASSOU (1)');
  });

  it('should display failed badge color when totalFailed is greater than zero', () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        result: {
          status: 500,
          statusText: 'Internal Server Error',
          durationMs: 30,
          sizeBytes: 40,
          headers: {},
          data: null,
          testResults: {
            results: [
              { name: 'Status 200', passed: false, error: 'Expected 200, got 500', durationMs: 1 },
            ],
            environmentMutations: [],
            totalPassed: 0,
            totalFailed: 1,
            durationMs: 1,
          },
        },
      },
    });

    const badge = wrapper.find('span.bg-magma-500\\/30');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('0/1');
  });

  it('should display validation issues and remediation when validationIssues are present', () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        result: {
          status: 0,
          statusText: 'Validation Error',
          durationMs: 0,
          sizeBytes: 0,
          headers: {},
          data: null,
          error: 'A URL da requisição não pode estar vazia.',
          validationIssues: [
            {
              code: 'URL_EMPTY',
              category: 'url',
              message: 'A URL da requisição não pode estar vazia.',
              remediation: 'Informe uma URL válida ou um caminho relativo.',
            },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('A URL da requisição não pode estar vazia.');
    expect(wrapper.text()).toContain('Informe uma URL válida ou um caminho relativo.');
  });

  it('should switch to diff tab and render response-diff-viewer', async () => {
    const wrapper = mount(ResponseViewer, {
      props: {
        loading: false,
        activeTabId: 'tab-1',
        result: {
          status: 200,
          statusText: 'OK',
          durationMs: 45,
          sizeBytes: 128,
          headers: {},
          data: { dino: 'T-Rex' },
        },
      },
    });

    const diffBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Comparar'));
    expect(diffBtn).toBeDefined();
    await diffBtn?.trigger('click');

    expect(wrapper.text()).toContain('Comparar com:');
  });
});
