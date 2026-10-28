import { beforeEach, describe, expect, it } from 'vitest';
import { useResponseDiffViewer, resetDiffSnapshot } from '../use-response-diff-viewer';
import { useRequest } from '../../../request';
import type { ExecutionResult } from '../../../request/interfaces';

describe('useResponseDiffViewer', () => {
  beforeEach(() => {
    resetDiffSnapshot();
  });
  const sampleResultA: ExecutionResult = {
    status: 200,
    statusText: 'OK',
    durationMs: 50,
    sizeBytes: 1024,
    headers: { 'content-type': 'application/json' },
    data: { id: 1, name: 'Dino A' },
  };

  const sampleResultB: ExecutionResult = {
    status: 201,
    statusText: 'Created',
    durationMs: 80,
    sizeBytes: 1500,
    headers: { 'content-type': 'application/json', 'x-custom': 'val' },
    data: { id: 1, name: 'Dino B' },
  };

  it('should initialize with default states and format deltas correctly', () => {
    const {
      viewMode,
      onlyDifferences,
      targetTabId,
      setViewMode,
      toggleOnlyDifferences,
      setTargetTabId,
      formatDurationDelta,
      formatSizeDelta,
    } = useResponseDiffViewer({
      currentResult: sampleResultA,
      activeTabId: 'tab-1',
    });

    expect(viewMode.value).toBe('split');
    expect(onlyDifferences.value).toBe(false);
    expect(targetTabId.value).toBe('');

    setViewMode('unified');
    expect(viewMode.value).toBe('unified');

    toggleOnlyDifferences();
    expect(onlyDifferences.value).toBe(true);

    setTargetTabId('tab-2');
    expect(targetTabId.value).toBe('tab-2');

    expect(formatDurationDelta(null)).toBe('0 ms');
    expect(formatDurationDelta(35)).toBe('+35 ms');
    expect(formatDurationDelta(-20)).toBe('-20 ms');

    expect(formatSizeDelta(null)).toBe('0 B');
    expect(formatSizeDelta(500)).toBe('+500 B');
    expect(formatSizeDelta(-300)).toBe('-300 B');
    expect(formatSizeDelta(2048)).toBe('+2.00 KB');
    expect(formatSizeDelta(5 * 1024 * 1024)).toBe('+5.00 MB');
    expect(formatSizeDelta(-5 * 1024 * 1024)).toBe('-5.00 MB');
  });

  it('should handle undefined activeTabId and tab without result', () => {
    const diff = useResponseDiffViewer({
      currentResult: sampleResultA,
    });

    diff.setTargetTabId('non-existent-tab-id');
    expect(diff.targetResult.value).toBeNull();
  });

  it('should support pinning and clearing snapshots', () => {
    const diff = useResponseDiffViewer({
      currentResult: sampleResultA,
      activeTabId: 'tab-1',
    });

    expect(diff.isSnapshotPinned.value).toBe(false);

    diff.pinSnapshot();
    expect(diff.isSnapshotPinned.value).toBe(true);
    expect(diff.targetTabId.value).toBe('snapshot');
    expect(diff.targetResult.value).toEqual(sampleResultA);

    const snapshotTarget = diff.availableTargets.value.find((t) => t.id === 'snapshot');
    expect(snapshotTarget).toBeDefined();
    expect(snapshotTarget?.isSnapshot).toBe(true);

    diff.clearSnapshot();
    expect(diff.isSnapshotPinned.value).toBe(false);
    expect(diff.targetTabId.value).toBe('');
  });

  it('should list available target tabs from useRequest', () => {
    const { createTab, closeTab, tabs } = useRequest();
    while (tabs.value.length > 0) {
      const first = tabs.value[0];
      if (!first) {
        break;
      }
      closeTab(first.id);
    }

    const t1 = createTab({ name: 'Tab 1' });
    const t2 = createTab({ name: 'Tab 2' });

    const diff = useResponseDiffViewer({
      currentResult: sampleResultA,
      activeTabId: t1.id,
    });

    const targets = diff.availableTargets.value;
    expect(targets.some((t) => t.id === t2.id)).toBe(true);
    expect(targets.some((t) => t.id === t1.id)).toBe(false);
  });

  it('should compute diff and filter differences when onlyDifferences is enabled', () => {
    const diff = useResponseDiffViewer({
      currentResult: sampleResultA,
      activeTabId: 'tab-1',
    });

    diff.pinSnapshot();
    expect(diff.diffResult.value.summary.hasDifferences).toBe(false);

    const diffWithOther = useResponseDiffViewer({
      currentResult: sampleResultA,
      activeTabId: 'tab-1',
    });

    diffWithOther.pinSnapshot();
    diffWithOther.targetTabId.value = 'snapshot';

    expect(diffWithOther.filteredLines.value.length).toBeGreaterThan(0);

    diffWithOther.toggleOnlyDifferences();
    expect(diffWithOther.filteredLines.value.length).toBe(0);
  });

  it('should compute diff against another target result', () => {
    const { createTab } = useRequest();
    const otherTab = createTab({
      name: 'Other Tab',
      url: 'https://eusouanderson.github.io/Trex-Http-Client/get',
      method: 'GET',
    });

    const diff = useResponseDiffViewer({
      currentResult: sampleResultB,
      activeTabId: 'tab-different',
    });

    diff.setTargetTabId(otherTab.id);
    expect(diff.targetTabId.value).toBe(otherTab.id);
  });

  it('should return correct line numbers and symbols', () => {
    const diff = useResponseDiffViewer({
      currentResult: sampleResultA,
    });

    expect(diff.getLineNumber(5)).toBe('5');
    expect(diff.getLineNumber(null)).toBe(' ');

    expect(diff.getLineContent('text')).toBe('text');
    expect(diff.getLineContent('')).toBe('\u00A0');

    expect(diff.viewModeLabel.value).toBe('Modo Unificado');
    expect(diff.onlyDifferencesLabel.value).toBe('Apenas Diferenças');

    diff.toggleViewMode();
    expect(diff.viewMode.value).toBe('unified');
    expect(diff.viewModeLabel.value).toBe('Modo Lado a Lado');

    diff.toggleViewMode();
    expect(diff.viewMode.value).toBe('split');

    diff.toggleOnlyDifferences();
    expect(diff.onlyDifferencesLabel.value).toBe('Todas as Linhas');

    expect(diff.getDiffSymbolLeft('removed')).toBe('-');
    expect(diff.getDiffSymbolLeft('modified')).toBe('~');
    expect(diff.getDiffSymbolLeft('added')).toBe(' ');
    expect(diff.getDiffSymbolLeft('unchanged')).toBe(' ');

    expect(diff.getDiffSymbolRight('added')).toBe('+');
    expect(diff.getDiffSymbolRight('modified')).toBe('~');
    expect(diff.getDiffSymbolRight('removed')).toBe(' ');
    expect(diff.getDiffSymbolRight('unchanged')).toBe(' ');

    expect(diff.getUnifiedSymbol('added')).toBe('+');
    expect(diff.getUnifiedSymbol('removed')).toBe('-');
    expect(diff.getUnifiedSymbol('modified')).toBe('~');
    expect(diff.getUnifiedSymbol('unchanged')).toBe(' ');

    const lineRem = {
      lineNumberLeft: 1,
      lineNumberRight: null,
      type: 'removed' as const,
      contentLeft: 'old',
      contentRight: '',
    };
    const lineAdd = {
      lineNumberLeft: null,
      lineNumberRight: 1,
      type: 'added' as const,
      contentLeft: '',
      contentRight: 'new',
    };
    expect(diff.getUnifiedContent(lineRem)).toBe('old');
    expect(diff.getUnifiedContent(lineAdd)).toBe('new');

    expect(diff.getLineClassLeft('removed')).toContain('text-magma-300');
    expect(diff.getLineClassLeft('modified')).toContain('text-amber-300');
    expect(diff.getLineClassLeft('added')).toBe('opacity-30');
    expect(diff.getLineClassLeft('unchanged')).toBe('text-bone-200');

    expect(diff.getLineClassRight('added')).toContain('text-dino-300');
    expect(diff.getLineClassRight('modified')).toContain('text-amber-300');
    expect(diff.getLineClassRight('removed')).toBe('opacity-30');
    expect(diff.getLineClassRight('unchanged')).toBe('text-bone-200');

    expect(diff.getUnifiedClass('added')).toContain('text-dino-300');
    expect(diff.getUnifiedClass('removed')).toContain('text-magma-300');
    expect(diff.getUnifiedClass('modified')).toContain('text-amber-300');
    expect(diff.getUnifiedClass('unchanged')).toBe('text-bone-200');
  });
});
