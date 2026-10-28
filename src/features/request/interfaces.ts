import type { HttpMethod } from '../../core/http/interfaces';
import type { AuthConfig } from '../../core/security/interfaces';
import type { TestExecutionReport } from '../../core/scripts';
import type { Collection } from '../collections/interfaces';
import type { Environment } from '../environments/interfaces';

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
  auth?: AuthConfig;
  testScript?: string;
  collectionId?: string;
  isDirty: boolean;
  status?: number;
}

type ValidationCategory =
  | 'url'
  | 'environment'
  | 'variable'
  | 'header'
  | 'param'
  | 'body'
  | 'auth'
  | 'execution';

interface ValidationIssue {
  code: string;
  category: ValidationCategory;
  message: string;
  field?: string;
  variableName?: string;
  remediation: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

interface PreparationContext {
  environment?: Environment | null;
  collection?: Collection | null;
}

interface PreparedRequest {
  url: string;
  method: RequestTab['method'];
  headers: Record<string, string>;
  params: Record<string, string>;
  body: string;
  maskedHeaders: Record<string, string>;
  maskedParams: Record<string, string>;
  maskedUrl: string;
  secrets: string[];
}

interface ExecutionResult {
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: unknown;
  error?: string;
  testResults?: TestExecutionReport;
  validationIssues?: ValidationIssue[];
}

interface IRequestRunnerService {
  execute(tab: RequestTab, timeoutMs?: number, prepared?: PreparedRequest): Promise<ExecutionResult>;
}

interface IRequestValidatorService {
  validate(tab: RequestTab, context?: PreparationContext, timeoutMs?: number): ValidationResult;
}

export type {
  KeyValuePair,
  BodyType,
  RequestTab,
  ValidationCategory,
  ValidationIssue,
  ValidationResult,
  PreparationContext,
  PreparedRequest,
  ExecutionResult,
  IRequestRunnerService,
  IRequestValidatorService,
};
