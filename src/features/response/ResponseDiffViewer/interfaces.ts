import type { ComputedRef, Ref } from 'vue';
import type { ExecutionResult } from '../../request/interfaces';
import type { DiffLine, DiffOperation, ResponseDiffResult } from '../../../core/diff';

type DiffViewMode = 'split' | 'unified';

interface DiffTargetOption {
  id: string;
  name: string;
  method: string;
  hasResult: boolean;
  isSnapshot: boolean;
}

interface ResponseDiffViewerProps {
  currentResult: ExecutionResult | null;
  activeTabId?: string;
}

interface UseResponseDiffViewerReturn {
  targetTabId: Ref<string>;
  viewMode: Ref<DiffViewMode>;
  onlyDifferences: Ref<boolean>;
  isSnapshotPinned: ComputedRef<boolean>;
  availableTargets: ComputedRef<DiffTargetOption[]>;
  targetResult: ComputedRef<ExecutionResult | null>;
  diffResult: ComputedRef<ResponseDiffResult>;
  filteredLines: ComputedRef<DiffLine[]>;
  setTargetTabId: (id: string) => void;
  setViewMode: (mode: DiffViewMode) => void;
  toggleViewMode: () => void;
  viewModeLabel: ComputedRef<string>;
  onlyDifferencesLabel: ComputedRef<string>;
  toggleOnlyDifferences: () => void;
  pinSnapshot: () => void;
  clearSnapshot: () => void;
  formatDurationDelta: (ms: number | null) => string;
  formatSizeDelta: (bytes: number | null) => string;
  getLineNumber: (num: number | null) => string;
  getLineContent: (content: string) => string;
  getDiffSymbolLeft: (type: DiffOperation) => string;
  getDiffSymbolRight: (type: DiffOperation) => string;
  getUnifiedSymbol: (type: DiffOperation) => string;
  getUnifiedContent: (line: DiffLine) => string;
  getLineClassLeft: (type: DiffOperation) => string;
  getLineClassRight: (type: DiffOperation) => string;
  getUnifiedClass: (type: DiffOperation) => string;
}

export type {
  DiffViewMode,
  DiffTargetOption,
  ResponseDiffViewerProps,
  UseResponseDiffViewerReturn,
};
