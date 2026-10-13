import type { ComputedRef } from 'vue';
import type {
  EnvironmentMutation,
  TestAssertionResult,
  TestExecutionReport,
} from '../../../core/scripts';

interface TestResultsViewerProps {
  report?: TestExecutionReport | null;
}

interface UseTestResultsViewerReturn {
  totalPassed: ComputedRef<number>;
  totalFailed: ComputedRef<number>;
  hasResults: ComputedRef<boolean>;
  results: ComputedRef<TestAssertionResult[]>;
  mutations: ComputedRef<EnvironmentMutation[]>;
}

export type { TestResultsViewerProps, UseTestResultsViewerReturn };
