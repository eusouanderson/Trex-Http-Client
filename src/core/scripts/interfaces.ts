interface TestAssertionResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

interface EnvironmentMutation {
  key: string;
  value: string;
}

interface TestExecutionReport {
  results: TestAssertionResult[];
  environmentMutations: EnvironmentMutation[];
  totalPassed: number;
  totalFailed: number;
  durationMs: number;
  error?: string;
}

interface ScriptResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  durationMs: number;
}

interface ScriptExecutionContext {
  response: ScriptResponseData;
  environmentVariables: Record<string, string>;
}

interface IAssertionChain {
  to: IAssertionChain;
  be: IAssertionChain;
  have: IAssertionChain;
  not: IAssertionChain;
  equal(expected: unknown): IAssertionChain;
  eql(expected: unknown): IAssertionChain;
  a(expectedType: string): IAssertionChain;
  an(expectedType: string): IAssertionChain;
  ok: IAssertionChain;
  true: IAssertionChain;
  false: IAssertionChain;
  null: IAssertionChain;
  undefined: IAssertionChain;
  empty: IAssertionChain;
  property(name: string, value?: unknown): IAssertionChain;
  lengthOf(expectedLength: number): IAssertionChain;
  include(expectedItem: unknown): IAssertionChain;
}

interface IPmEnvironment {
  get(key: string): string | undefined;
  set(key: string, value: unknown): void;
}

interface IPmResponse {
  code: number;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  text(): string;
  json(): unknown;
  to: {
    have: {
      status(expectedStatus: number): void;
    };
  };
}

interface IPmContext {
  test(name: string, fn: () => void): void;
  expect(actual: unknown): IAssertionChain;
  response: IPmResponse;
  environment: IPmEnvironment;
}

type ITxContext = IPmContext;
type ITxResponse = IPmResponse;
type ITxEnvironment = IPmEnvironment;

interface IScriptSandboxService {
  execute(
    script: string,
    context: ScriptExecutionContext,
    timeoutMs?: number,
  ): Promise<TestExecutionReport>;
}

export type {
  TestAssertionResult,
  EnvironmentMutation,
  TestExecutionReport,
  ScriptResponseData,
  ScriptExecutionContext,
  IAssertionChain,
  IPmEnvironment,
  IPmResponse,
  IPmContext,
  ITxContext,
  ITxResponse,
  ITxEnvironment,
  IScriptSandboxService,
};

