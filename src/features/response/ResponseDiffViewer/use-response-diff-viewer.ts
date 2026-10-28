import { computed, ref } from 'vue';
import { JsonDiffService } from '../../../core/diff';
import type { DiffLine, DiffOperation, ResponseDiffResult } from '../../../core/diff';
import { useRequest } from '../../request';
import type { ExecutionResult } from '../../request/interfaces';
import type {
  DiffTargetOption,
  DiffViewMode,
  ResponseDiffViewerProps,
  UseResponseDiffViewerReturn,
} from './interfaces';

const jsonDiffService = new JsonDiffService();
const snapshotResultState = ref<ExecutionResult | null>(null);

const resetDiffSnapshot = (): void => {
  snapshotResultState.value = null;
};

const useResponseDiffViewer = (props: ResponseDiffViewerProps): UseResponseDiffViewerReturn => {
  const { tabs, executionResultsByTab } = useRequest();

  const targetTabIdState = ref<string>('');
  const viewModeState = ref<DiffViewMode>('split');
  const onlyDifferencesState = ref<boolean>(false);

  const isSnapshotPinned = computed<boolean>(() => snapshotResultState.value !== null);

  const availableTargets = computed<DiffTargetOption[]>(() => {
    const list: DiffTargetOption[] = [];

    if (snapshotResultState.value) {
      list.push({
        id: 'snapshot',
        name: 'Snapshot Fixado',
        method: 'SNAP',
        hasResult: true,
        isSnapshot: true,
      });
    }

    const currentTabId = props.activeTabId ?? '';

    for (const tab of tabs.value) {
      if (tab.id !== currentTabId) {
        const hasResult = Boolean(executionResultsByTab.value[tab.id]);
        list.push({
          id: tab.id,
          name: tab.name,
          method: tab.method,
          hasResult,
          isSnapshot: false,
        });
      }
    }

    return list;
  });

  const targetResult = computed<ExecutionResult | null>(() => {
    if (targetTabIdState.value === 'snapshot') {
      return snapshotResultState.value;
    }
    if (!targetTabIdState.value) {
      return null;
    }
    return executionResultsByTab.value[targetTabIdState.value] ?? null;
  });

  const diffResult = computed<ResponseDiffResult>(() => {
    return jsonDiffService.compare(props.currentResult, targetResult.value);
  });

  const filteredLines = computed<DiffLine[]>(() => {
    const all = diffResult.value.body.lines;
    if (onlyDifferencesState.value) {
      return all.filter((line) => line.type !== 'unchanged');
    }
    return all;
  });

  const setTargetTabId = (id: string): void => {
    targetTabIdState.value = id;
  };

  const setViewMode = (mode: DiffViewMode): void => {
    viewModeState.value = mode;
  };

  const toggleViewMode = (): void => {
    viewModeState.value = viewModeState.value === 'split' ? 'unified' : 'split';
  };

  const viewModeLabel = computed<string>(() => {
    return viewModeState.value === 'split' ? 'Modo Unificado' : 'Modo Lado a Lado';
  });

  const onlyDifferencesLabel = computed<string>(() => {
    return onlyDifferencesState.value ? 'Todas as Linhas' : 'Apenas Diferenças';
  });

  const toggleOnlyDifferences = (): void => {
    onlyDifferencesState.value = !onlyDifferencesState.value;
  };

  const pinSnapshot = (): void => {
    if (props.currentResult) {
      snapshotResultState.value = JSON.parse(JSON.stringify(props.currentResult)) as ExecutionResult;
      targetTabIdState.value = 'snapshot';
    }
  };

  const clearSnapshot = (): void => {
    snapshotResultState.value = null;
    if (targetTabIdState.value === 'snapshot') {
      targetTabIdState.value = '';
    }
  };

  const formatDurationDelta = (ms: number | null): string => {
    if (ms === null) {
      return '0 ms';
    }
    if (ms > 0) {
      return `+${ms.toString()} ms`;
    }
    return `${ms.toString()} ms`;
  };

  const formatSizeDelta = (bytes: number | null): string => {
    if (bytes === null) {
      return '0 B';
    }
    const absBytes = Math.abs(bytes);
    const sign = bytes >= 0 ? '+' : '-';
    if (absBytes < 1024) {
      return `${sign}${absBytes.toString()} B`;
    }
    if (absBytes < 1024 * 1024) {
      return `${sign}${(absBytes / 1024).toFixed(2)} KB`;
    }
    return `${sign}${(absBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getLineNumber = (num: number | null): string => {
    return num !== null ? num.toString() : ' ';
  };

  const getLineContent = (content: string): string => {
    return content.length > 0 ? content : '\u00A0';
  };

  const getDiffSymbolLeft = (type: DiffOperation): string => {
    if (type === 'removed') {
      return '-';
    }
    if (type === 'modified') {
      return '~';
    }
    return ' ';
  };

  const getDiffSymbolRight = (type: DiffOperation): string => {
    if (type === 'added') {
      return '+';
    }
    if (type === 'modified') {
      return '~';
    }
    return ' ';
  };

  const getUnifiedSymbol = (type: DiffOperation): string => {
    if (type === 'added') {
      return '+';
    }
    if (type === 'removed') {
      return '-';
    }
    if (type === 'modified') {
      return '~';
    }
    return ' ';
  };

  const getUnifiedContent = (line: DiffLine): string => {
    return line.type === 'removed' ? line.contentLeft : line.contentRight;
  };

  const getLineClassLeft = (type: DiffOperation): string => {
    if (type === 'removed') {
      return 'bg-magma-500/10 text-magma-300';
    }
    if (type === 'modified') {
      return 'bg-amber-500/10 text-amber-300';
    }
    if (type === 'added') {
      return 'opacity-30';
    }
    return 'text-bone-200';
  };

  const getLineClassRight = (type: DiffOperation): string => {
    if (type === 'added') {
      return 'bg-dino-500/10 text-dino-300';
    }
    if (type === 'modified') {
      return 'bg-amber-500/10 text-amber-300';
    }
    if (type === 'removed') {
      return 'opacity-30';
    }
    return 'text-bone-200';
  };

  const getUnifiedClass = (type: DiffOperation): string => {
    if (type === 'added') {
      return 'bg-dino-500/10 text-dino-300 border-l-2 border-dino-400';
    }
    if (type === 'removed') {
      return 'bg-magma-500/10 text-magma-300 border-l-2 border-magma-400';
    }
    if (type === 'modified') {
      return 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400';
    }
    return 'text-bone-200';
  };

  return {
    targetTabId: targetTabIdState,
    viewMode: viewModeState,
    onlyDifferences: onlyDifferencesState,
    isSnapshotPinned,
    availableTargets,
    targetResult,
    diffResult,
    filteredLines,
    setTargetTabId,
    setViewMode,
    toggleViewMode,
    viewModeLabel,
    onlyDifferencesLabel,
    toggleOnlyDifferences,
    pinSnapshot,
    clearSnapshot,
    formatDurationDelta,
    formatSizeDelta,
    getLineNumber,
    getLineContent,
    getDiffSymbolLeft,
    getDiffSymbolRight,
    getUnifiedSymbol,
    getUnifiedContent,
    getLineClassLeft,
    getLineClassRight,
    getUnifiedClass,
  };
};

export { useResponseDiffViewer, resetDiffSnapshot };
