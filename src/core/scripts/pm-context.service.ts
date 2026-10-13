import { AssertionChain } from './assertion.service';
import type {
  EnvironmentMutation,
  IAssertionChain,
  IPmContext,
  IPmEnvironment,
  IPmResponse,
  ScriptExecutionContext,
  TestAssertionResult,
  TestExecutionReport,
} from './interfaces';

class PmContextService {
  private readonly results: TestAssertionResult[] = [];
  private readonly environmentMutations: EnvironmentMutation[] = [];

  constructor(private readonly executionContext: ScriptExecutionContext) {}

  public createContext(): IPmContext {
    const environment: IPmEnvironment = {
      get: (key: string): string | undefined => {
        return this.executionContext.environmentVariables[key];
      },
      set: (key: string, value: unknown): void => {
        if (value === undefined) {
          return;
        }
        let serializedValue: string;
        if (typeof value === 'string') {
          serializedValue = value;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          serializedValue = value.toString();
        } else {
          serializedValue = JSON.stringify(value);
        }
        this.environmentMutations.push({ key, value: serializedValue });
      },
    };

    const response: IPmResponse = {
      code: this.executionContext.response.status,
      status: this.executionContext.response.status,
      statusText: this.executionContext.response.statusText,
      headers: { ...this.executionContext.response.headers },
      text: (): string => {
        const data = this.executionContext.response.data;
        return typeof data === 'string' ? data : JSON.stringify(data);
      },
      json: (): unknown => {
        return this.executionContext.response.data;
      },
      to: {
        have: {
          status: (expectedStatus: number): void => {
            new AssertionChain(this.executionContext.response.status).to.equal(
              expectedStatus,
            );
          },
        },
      },
    };

    const expect = (actual: unknown, message?: string): IAssertionChain => {
      return new AssertionChain(actual, false, message);
    };

    const test = (name: string, fn: () => void): void => {
      const startTime = performance.now();
      try {
        fn();
        this.results.push({
          name,
          passed: true,
          durationMs: Math.round(performance.now() - startTime),
        });
      } catch (err) {
        this.results.push({
          name,
          passed: false,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Math.round(performance.now() - startTime),
        });
      }
    };

    return {
      test,
      expect,
      response,
      environment,
    };
  }

  public getEnvironmentMutations(): EnvironmentMutation[] {
    return [...this.environmentMutations];
  }

  public generateReport(durationMs: number, error?: string): TestExecutionReport {
    const totalPassed = this.results.filter((r) => r.passed).length;
    const totalFailed = this.results.filter((r) => !r.passed).length;

    return {
      results: [...this.results],
      environmentMutations: [...this.environmentMutations],
      totalPassed,
      totalFailed,
      durationMs,
      error,
    };
  }
}

export { PmContextService };
