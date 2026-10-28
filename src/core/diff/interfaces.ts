type DiffOperation = 'added' | 'removed' | 'modified' | 'unchanged';

interface DiffLine {
  lineNumberLeft: number | null;
  lineNumberRight: number | null;
  type: DiffOperation;
  contentLeft: string;
  contentRight: string;
}

interface DiffSummary {
  totalAdded: number;
  totalRemoved: number;
  totalModified: number;
  totalUnchanged: number;
  hasDifferences: boolean;
}

interface MetaDiff {
  statusLeft: number | null;
  statusRight: number | null;
  statusEqual: boolean;
  durationLeftMs: number | null;
  durationRightMs: number | null;
  durationDeltaMs: number | null;
  sizeLeftBytes: number | null;
  sizeRightBytes: number | null;
  sizeDeltaBytes: number | null;
}

interface HeaderDiffItem {
  key: string;
  type: DiffOperation;
  valueLeft: string | null;
  valueRight: string | null;
}

interface TextDiffResult {
  lines: DiffLine[];
  summary: DiffSummary;
}

interface ResponseDiffResult {
  meta: MetaDiff;
  headers: HeaderDiffItem[];
  body: TextDiffResult;
  summary: DiffSummary;
}

export type {
  DiffOperation,
  DiffLine,
  DiffSummary,
  MetaDiff,
  HeaderDiffItem,
  TextDiffResult,
  ResponseDiffResult,
};
