import { describe, expect, it } from 'vitest';
import { useTestResultsViewer } from '../use-test-results-viewer';
import type { TestExecutionReport } from '../../../../core/scripts';
import type { UseTestResultsViewerReturn } from '../interfaces';

describe('useTestResultsViewer', () => {
  it('deve computar estatisticas vazias quando report for nulo ou indefinido', () => {
    const viewer: UseTestResultsViewerReturn = useTestResultsViewer({});
    const totalPassed = viewer.totalPassed;
    const totalFailed = viewer.totalFailed;
    const hasResults = viewer.hasResults;
    const results = viewer.results;
    const mutations = viewer.mutations;

    expect(totalPassed.value).toBe(0);
    expect(totalFailed.value).toBe(0);
    expect(hasResults.value).toBe(false);
    expect(results.value).toEqual([]);
    expect(mutations.value).toEqual([]);
  });

  it('deve computar estatisticas e listas corretamente a partir do report fornecido', () => {
    const mockReport: TestExecutionReport = {
      results: [
        { name: 'Status 200', passed: true, durationMs: 2 },
        { name: 'Campo token', passed: false, error: 'Expected string', durationMs: 5 },
      ],
      environmentMutations: [
        { key: 'user_id', value: '42' },
      ],
      totalPassed: 1,
      totalFailed: 1,
      durationMs: 7,
    };

    const viewer: UseTestResultsViewerReturn = useTestResultsViewer({ report: mockReport });
    const totalPassed = viewer.totalPassed;
    const totalFailed = viewer.totalFailed;
    const hasResults = viewer.hasResults;
    const results = viewer.results;
    const mutations = viewer.mutations;

    expect(totalPassed.value).toBe(1);
    expect(totalFailed.value).toBe(1);
    expect(hasResults.value).toBe(true);
    expect(results.value).toHaveLength(2);
    expect(mutations.value).toHaveLength(1);
    expect(mutations.value[0]?.key).toBe('user_id');
  });
});
