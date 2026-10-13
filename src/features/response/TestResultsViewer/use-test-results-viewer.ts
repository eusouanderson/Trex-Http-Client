import { computed } from 'vue';
import type {
  EnvironmentMutation,
  TestAssertionResult,
} from '../../../core/scripts';
import type {
  TestResultsViewerProps,
  UseTestResultsViewerReturn,
} from './interfaces';

const useTestResultsViewer = (
  props: TestResultsViewerProps,
): UseTestResultsViewerReturn => {
  const totalPassed = computed<number>(() => props.report?.totalPassed ?? 0);
  const totalFailed = computed<number>(() => props.report?.totalFailed ?? 0);
  const hasResults = computed<boolean>(
    () => (props.report?.results.length ?? 0) > 0,
  );
  const results = computed<TestAssertionResult[]>(
    () => props.report?.results ?? [],
  );
  const mutations = computed<EnvironmentMutation[]>(
    () => props.report?.environmentMutations ?? [],
  );

  return {
    totalPassed,
    totalFailed,
    hasResults,
    results,
    mutations,
  };
};

export { useTestResultsViewer };
