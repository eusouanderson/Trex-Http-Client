import type { HttpMethod } from '../../core/http/interfaces';

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

type BodyType = 'none' | 'json' | 'text';

interface RequestTab {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: BodyType;
  body: string;
  isDirty: boolean;
  status?: number;
}

interface ExecutionResult {
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: unknown;
  error?: string;
}

interface IRequestRunnerService {
  execute(tab: RequestTab, timeoutMs?: number): Promise<ExecutionResult>;
}

export type {
  KeyValuePair,
  BodyType,
  RequestTab,
  ExecutionResult,
  IRequestRunnerService,
};
