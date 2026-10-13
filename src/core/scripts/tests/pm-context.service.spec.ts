import { describe, expect, it } from 'vitest';
import { PmContextService } from '../pm-context.service';
import type { ScriptExecutionContext } from '../interfaces';

describe('PmContextService', () => {
  const mockContext: ScriptExecutionContext = {
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { id: 10, name: 'Trex', active: true },
      durationMs: 42,
    },
    environmentVariables: {
      base_url: 'https://api.trex.dev',
      token: 'secret-token',
    },
  };

  it('deve disponibilizar propriedades de pm.response corretamente', () => {
    const service = new PmContextService(mockContext);
    const pm = service.createContext();

    expect(pm.response.code).toBe(200);
    expect(pm.response.status).toBe(200);
    expect(pm.response.statusText).toBe('OK');
    expect(pm.response.headers).toEqual({ 'content-type': 'application/json' });
    expect(pm.response.text()).toContain('"name":"Trex"');
    expect(pm.response.json()).toEqual({ id: 10, name: 'Trex', active: true });
  });

  it('deve disponibilizar pm.response.to.have.status', () => {
    const service = new PmContextService(mockContext);
    const pm = service.createContext();

    expect(() => { pm.response.to.have.status(200); }).not.toThrow();
    expect(() => { pm.response.to.have.status(404); }).toThrow();
  });

  it('deve obter e registrar mutacoes em pm.environment', () => {
    const service = new PmContextService(mockContext);
    const pm = service.createContext();

    expect(pm.environment.get('token')).toBe('secret-token');
    expect(pm.environment.get('inexistente')).toBeUndefined();

    pm.environment.set('user_id', 123);
    pm.environment.set('user_name', 'Dino');
    pm.environment.set('complex_obj', { role: 'admin' });
    pm.environment.set('invalid_val', undefined);

    const mutations = service.getEnvironmentMutations();
    expect(mutations).toHaveLength(3);
    expect(mutations[0]).toEqual({ key: 'user_id', value: '123' });
    expect(mutations[1]).toEqual({ key: 'user_name', value: 'Dino' });
    expect(mutations[2]).toEqual({ key: 'complex_obj', value: '{"role":"admin"}' });
  });

  it('deve executar pm.test isolando testes que falham de testes que passam', () => {
    const service = new PmContextService(mockContext);
    const pm = service.createContext();

    pm.test('Teste 1 deve passar', () => {
      pm.expect(pm.response.status).to.equal(200);
    });

    pm.test('Teste 2 deve falhar', () => {
      pm.expect(pm.response.status).to.equal(500);
    });

    pm.test('Teste 3 deve passar apos a falha', () => {
      const data = pm.response.json() as { name: string };
      pm.expect(data.name).to.equal('Trex');
    });

    const report = service.generateReport(15);
    expect(report.results).toHaveLength(3);
    expect(report.totalPassed).toBe(2);
    expect(report.totalFailed).toBe(1);
    expect(report.results[0]?.passed).toBe(true);
    expect(report.results[1]?.passed).toBe(false);
    expect(report.results[1]?.error).toBeDefined();
    expect(report.results[2]?.passed).toBe(true);
  });

  it('deve lidar com response.data string e erros nao-Error em pm.test', () => {
    const stringContext: ScriptExecutionContext = {
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: 'corpo de texto puro',
        durationMs: 10,
      },
      environmentVariables: {},
    };

    const service = new PmContextService(stringContext);
    const pm = service.createContext();

    expect(pm.response.text()).toBe('corpo de texto puro');

    pm.test('Erro com string pura', () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'Falha em string';
    });

    const report = service.generateReport(5);
    expect(report.results[0]?.passed).toBe(false);
    expect(report.results[0]?.error).toBe('Falha em string');
  });

  it('deve repassar mensagem customizada de expect para o AssertionChain', () => {
    const service = new PmContextService(mockContext);
    const pm = service.createContext();

    expect(() => {
      pm.expect(5, 'Meu campo').to.be.greaterThan(10);
    }).toThrow('Meu campo: Expected 5 to be greater than 10');
  });
});
