import type {
  IScriptSandboxService,
  ScriptExecutionContext,
  TestExecutionReport,
} from './interfaces';
import { PmContextService } from './pm-context.service';

class ScriptSandboxService implements IScriptSandboxService {
  public execute = async (
    script: string,
    context: ScriptExecutionContext,
    timeoutMs = 2000,
  ): Promise<TestExecutionReport> => {
    const trimmedScript = script.trim();
    if (trimmedScript.length === 0) {
      return {
        results: [],
        environmentMutations: [],
        totalPassed: 0,
        totalFailed: 0,
        durationMs: 0,
      };
    }

    const pmService = new PmContextService(context);
    const pm = pmService.createContext();
    const startTime = performance.now();

    await Promise.resolve();

    try {
      this.runSandboxed(trimmedScript, pm, timeoutMs);
      const durationMs = Math.round(performance.now() - startTime);
      return pmService.generateReport(durationMs);
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return pmService.generateReport(durationMs, errorMessage);
    }
  };

  private runSandboxed = (
    script: string,
    pm: unknown,
    timeoutMs: number,
  ): void => {
    const startExecution = performance.now();
    const checkTimeout = (): void => {
      if (performance.now() - startExecution > timeoutMs) {
        throw new Error(`Timeout de execução do script (${String(timeoutMs)}ms) excedido`);
      }
    };

    const transformedScript = this.injectTimeoutGuard(script);

    /* eslint-disable @typescript-eslint/no-implied-eval */
    const executor = new Function(
      'tx',
      'pm',
      '__checkTimeout',
      'window',
      'document',
      'localStorage',
      'indexedDB',
      'fetch',
      'XMLHttpRequest',
      `"use strict"; ${transformedScript}`,
    ) as (
      tx: unknown,
      pm: unknown,
      checkTimeout: () => void,
      w: undefined,
      d: undefined,
      ls: undefined,
      idb: undefined,
      f: undefined,
      xhr: undefined,
    ) => void;

    executor(
      pm,
      pm,
      checkTimeout,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    /* eslint-enable @typescript-eslint/no-implied-eval */
  };

  private injectTimeoutGuard = (script: string): string => {
    return script
      .replace(/\bwhile\s*\(([\s\S]*?)\)\s*\{/g, 'while ($1) { __checkTimeout(); ')
      .replace(/\bfor\s*\(([\s\S]*?)\)\s*\{/g, 'for ($1) { __checkTimeout(); ')
      .replace(/\bdo\s*\{/g, 'do { __checkTimeout(); ');
  };
}

export { ScriptSandboxService };
