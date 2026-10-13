import { describe, expect, it } from 'vitest';
import { ScriptSandboxService } from '../script-sandbox.service';
import type { ScriptExecutionContext } from '../interfaces';

describe('ScriptSandboxService', () => {
  const mockContext: ScriptExecutionContext = {
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { access_token: 'jwt-xyz-123', user: { id: 7, name: 'Trex' } },
      durationMs: 80,
    },
    environmentVariables: {
      base_url: 'https://api.trex.dev',
    },
  };

  it('deve retornar relatorio vazio se o script for vazio ou espacos', async () => {
    const sandbox = new ScriptSandboxService();
    const result = await sandbox.execute('   ', mockContext);

    expect(result.results).toHaveLength(0);
    expect(result.environmentMutations).toHaveLength(0);
    expect(result.totalPassed).toBe(0);
    expect(result.totalFailed).toBe(0);
  });

  it('deve executar script de teste com sucesso e capturar variaveis de ambiente usando pm', async () => {
    const sandbox = new ScriptSandboxService();
    const script = `
      pm.test("Status deve ser 200", () => {
        pm.response.to.have.status(200);
      });

      pm.test("Token deve existir e ser valido", () => {
        const body = pm.response.json();
        pm.expect(body.access_token).to.be.a("string");
        pm.expect(body.access_token).to.not.be.empty;
        pm.environment.set("access_token", body.access_token);
      });
    `;

    const report = await sandbox.execute(script, mockContext);

    expect(report.results).toHaveLength(2);
    expect(report.totalPassed).toBe(2);
    expect(report.totalFailed).toBe(0);
    expect(report.environmentMutations).toEqual([
      { key: 'access_token', value: 'jwt-xyz-123' },
    ]);
  });

  it('deve executar script de teste utilizando a sintaxe nativa tx', async () => {
    const sandbox = new ScriptSandboxService();
    const script = `
      tx.test("Status via tx", () => {
        tx.response.to.have.status(200);
      });

      tx.test("Validacao de corpo via tx", () => {
        const body = tx.response.json();
        tx.expect(body.user.name).to.equal("Trex");
        tx.environment.set("current_user", body.user.name);
      });
    `;

    const report = await sandbox.execute(script, mockContext);

    expect(report.results).toHaveLength(2);
    expect(report.totalPassed).toBe(2);
    expect(report.totalFailed).toBe(0);
    expect(report.environmentMutations).toEqual([
      { key: 'current_user', value: 'Trex' },
    ]);
  });

  it('deve capturar falhas de assercoes sem quebrar outros testes', async () => {
    const sandbox = new ScriptSandboxService();
    const script = `
      pm.test("Status deve ser 404", () => {
        pm.response.to.have.status(404);
      });

      pm.test("Usuario deve ser Trex", () => {
        const body = pm.response.json();
        pm.expect(body.user.name).to.equal("Trex");
      });
    `;

    const report = await sandbox.execute(script, mockContext);

    expect(report.results).toHaveLength(2);
    expect(report.totalPassed).toBe(1);
    expect(report.totalFailed).toBe(1);
    expect(report.results[0]?.passed).toBe(false);
    expect(report.results[1]?.passed).toBe(true);
  });

  it('deve lidar com erros de sintaxe ou de execucao no script sem quebrar a aplicacao', async () => {
    const sandbox = new ScriptSandboxService();
    const script = `
      pm.test("Erro de sintaxe", () => {
      // fechamento faltando ou variavel nao declarada
      naoExiste.metodo();
    `;

    const report = await sandbox.execute(script, mockContext);

    expect(report.error).toBeDefined();
    expect(report.totalFailed).toBe(0);
  });

  it('deve interromper e proteger contra loops ou execucao demorada via timeout', async () => {
    const sandbox = new ScriptSandboxService();
    const infiniteScript = `
      const start = Date.now();
      while (Date.now() - start < 1000) {}
    `;

    const report = await sandbox.execute(infiniteScript, mockContext, 50);
    expect(report.error).toBeDefined();
    expect(report.error).toContain('Timeout');
  });

  it('deve lidar com erro primitivo lancado fora do pm.test no script', async () => {
    const sandbox = new ScriptSandboxService();
    const script = `throw "Erro direto no script";`;

    const report = await sandbox.execute(script, mockContext);
    expect(report.error).toBe('Erro direto no script');
  });
});
