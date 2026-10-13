import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TestResultsViewer from '../index.vue';
import type { TestExecutionReport } from '../../../../core/scripts';

describe('TestResultsViewer Component', () => {
  it('deve exibir mensagem de nenhum teste quando report for nulo ou sem resultados', () => {
    const wrapper = mount(TestResultsViewer, {
      props: {
        report: null,
      },
    });

    expect(wrapper.text()).toContain('Nenhum teste de resposta foi executado');
  });

  it('deve renderizar contagem e detalhes de testes passados e reprovados e mutacoes', () => {
    const mockReport: TestExecutionReport = {
      results: [
        { name: 'Status 200', passed: true, durationMs: 3 },
        { name: 'Validar token', passed: false, error: 'Expected string, got undefined', durationMs: 4 },
      ],
      environmentMutations: [
        { key: 'access_token', value: 'token-123' },
      ],
      totalPassed: 1,
      totalFailed: 1,
      durationMs: 7,
    };

    const wrapper = mount(TestResultsViewer, {
      props: {
        report: mockReport,
      },
    });

    expect(wrapper.text()).toContain('PASSOU (1)');
    expect(wrapper.text()).toContain('FALHOU (1)');
    expect(wrapper.text()).toContain('Status 200');
    expect(wrapper.text()).toContain('Validar token');
    expect(wrapper.text()).toContain('Expected string, got undefined');
    expect(wrapper.text()).toContain('access_token');
    expect(wrapper.text()).toContain('token-123');
  });
});

