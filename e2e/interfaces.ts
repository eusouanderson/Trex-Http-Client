import type { Page } from '@playwright/test';

interface RequestParamInput {
  key: string;
  value: string;
  enabled?: boolean;
}

interface RequestHeaderInput {
  key: string;
  value: string;
  enabled?: boolean;
}

interface EnvironmentVariableInput {
  key: string;
  value: string;
  isSecret?: boolean;
}

interface ExecutionResultAssertion {
  status: number;
  statusText?: string;
}

interface TestPageContext {
  page: Page;
}

export type {
  RequestParamInput,
  RequestHeaderInput,
  EnvironmentVariableInput,
  ExecutionResultAssertion,
  TestPageContext,
};

