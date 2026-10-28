import type { ExecutionResult } from '../../features/request/interfaces';
import type { ResponseMeta } from '../../features/response/interfaces';
import type {
  DiffLine,
  DiffSummary,
  HeaderDiffItem,
  MetaDiff,
  ResponseDiffResult,
  TextDiffResult,
} from './interfaces';

interface UnchangedOp {
  type: 'unchanged';
  leftIndex: number;
  rightIndex: number;
}

interface RemovedOp {
  type: 'removed';
  leftIndex: number;
  rightIndex: null;
}

interface AddedOp {
  type: 'added';
  leftIndex: null;
  rightIndex: number;
}

type RawDiffOp = UnchangedOp | RemovedOp | AddedOp;

class JsonDiffService {
  public getLineAt = (lines: string[], index: number): string => {
    const line = lines[index];
    return typeof line === 'string' ? line : '';
  };

  public getTableValue = (table: number[][], row: number, col: number): number => {
    const r = table[row];
    if (!r) {
      return 0;
    }
    const val = r[col];
    return typeof val === 'number' ? val : 0;
  };

  public setTableValue = (table: number[][], row: number, col: number, val: number): void => {
    const r = table[row];
    if (r) {
      r[col] = val;
    }
  };

  public formatPayload = (data: unknown): string => {
    if (data === null || data === undefined) {
      return '';
    }
    if (typeof data === 'string') {
      try {
        const parsed: unknown = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  public computeMetaDiff = (
    left: ResponseMeta | null,
    right: ResponseMeta | null,
  ): MetaDiff => {
    const statusLeft = left?.status ?? null;
    const statusRight = right?.status ?? null;
    const statusEqual = statusLeft === statusRight;

    const durationLeftMs = left?.durationMs ?? null;
    const durationRightMs = right?.durationMs ?? null;
    const durationDeltaMs =
      durationLeftMs !== null && durationRightMs !== null
        ? durationRightMs - durationLeftMs
        : null;

    const sizeLeftBytes = left?.sizeBytes ?? null;
    const sizeRightBytes = right?.sizeBytes ?? null;
    const sizeDeltaBytes =
      sizeLeftBytes !== null && sizeRightBytes !== null
        ? sizeRightBytes - sizeLeftBytes
        : null;

    return {
      statusLeft,
      statusRight,
      statusEqual,
      durationLeftMs,
      durationRightMs,
      durationDeltaMs,
      sizeLeftBytes,
      sizeRightBytes,
      sizeDeltaBytes,
    };
  };

  public computeHeaderDiff = (
    left: Record<string, string>,
    right: Record<string, string>,
  ): HeaderDiffItem[] => {
    const allKeys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
    const items: HeaderDiffItem[] = [];

    for (const key of allKeys) {
      const valLeft = left[key] ?? null;
      const valRight = right[key] ?? null;

      if (valLeft !== null && valRight === null) {
        items.push({
          key,
          type: 'removed',
          valueLeft: valLeft,
          valueRight: null,
        });
      } else if (valLeft === null && valRight !== null) {
        items.push({
          key,
          type: 'added',
          valueLeft: null,
          valueRight: valRight,
        });
      } else if (valLeft === valRight) {
        items.push({
          key,
          type: 'unchanged',
          valueLeft: valLeft,
          valueRight: valRight,
        });
      } else {
        items.push({
          key,
          type: 'modified',
          valueLeft: valLeft,
          valueRight: valRight,
        });
      }
    }

    return items;
  };

  public computeTextDiff = (leftText: string, rightText: string): TextDiffResult => {
    if (leftText === '' && rightText === '') {
      return {
        lines: [],
        summary: {
          totalAdded: 0,
          totalRemoved: 0,
          totalModified: 0,
          totalUnchanged: 0,
          hasDifferences: false,
        },
      };
    }

    const leftLines = leftText === '' ? [] : leftText.split('\n');
    const rightLines = rightText === '' ? [] : rightText.split('\n');

    if (leftLines.length === 0) {
      const lines: DiffLine[] = rightLines.map((content, idx) => ({
        lineNumberLeft: null,
        lineNumberRight: idx + 1,
        type: 'added',
        contentLeft: '',
        contentRight: content,
      }));
      return {
        lines,
        summary: {
          totalAdded: lines.length,
          totalRemoved: 0,
          totalModified: 0,
          totalUnchanged: 0,
          hasDifferences: true,
        },
      };
    }

    if (rightLines.length === 0) {
      const lines: DiffLine[] = leftLines.map((content, idx) => ({
        lineNumberLeft: idx + 1,
        lineNumberRight: null,
        type: 'removed',
        contentLeft: content,
        contentRight: '',
      }));
      return {
        lines,
        summary: {
          totalAdded: 0,
          totalRemoved: lines.length,
          totalModified: 0,
          totalUnchanged: 0,
          hasDifferences: true,
        },
      };
    }

    const m = leftLines.length;
    const n = rightLines.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0));

    for (let i = 0; i < m; i += 1) {
      for (let j = 0; j < n; j += 1) {
        const leftItem = leftLines[i];
        const rightItem = rightLines[j];
        if (leftItem === rightItem) {
          this.setTableValue(dp, i + 1, j + 1, this.getTableValue(dp, i, j) + 1);
        } else {
          this.setTableValue(
            dp,
            i + 1,
            j + 1,
            Math.max(
              this.getTableValue(dp, i + 1, j),
              this.getTableValue(dp, i, j + 1),
            ),
          );
        }
      }
    }

    const rawOps: RawDiffOp[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      const leftLine = leftLines[i - 1];
      const rightLine = rightLines[j - 1];

      if (i > 0 && j > 0 && leftLine === rightLine) {
        rawOps.push({ type: 'unchanged', leftIndex: i - 1, rightIndex: j - 1 });
        i -= 1;
        j -= 1;
      } else if (
        j > 0 &&
        (i === 0 || this.getTableValue(dp, i, j - 1) >= this.getTableValue(dp, i - 1, j))
      ) {
        rawOps.push({ type: 'added', leftIndex: null, rightIndex: j - 1 });
        j -= 1;
      } else {
        rawOps.push({ type: 'removed', leftIndex: i - 1, rightIndex: null });
        i -= 1;
      }
    }

    rawOps.reverse();

    type RawChunk =
      | { type: 'unchanged'; op: UnchangedOp }
      | { type: 'change'; ops: (RemovedOp | AddedOp)[] };

    const chunks: RawChunk[] = [];
    for (const op of rawOps) {
      if (op.type === 'unchanged') {
        chunks.push({ type: 'unchanged', op });
      } else {
        const lastChunk = chunks[chunks.length - 1];
        if (lastChunk?.type === 'change') {
          lastChunk.ops.push(op);
        } else {
          chunks.push({ type: 'change', ops: [op] });
        }
      }
    }

    const lines: DiffLine[] = [];

    for (const chunk of chunks) {
      if (chunk.type === 'unchanged') {
        lines.push({
          lineNumberLeft: chunk.op.leftIndex + 1,
          lineNumberRight: chunk.op.rightIndex + 1,
          type: 'unchanged',
          contentLeft: this.getLineAt(leftLines, chunk.op.leftIndex),
          contentRight: this.getLineAt(rightLines, chunk.op.rightIndex),
        });
      } else {
        const removedBatch: RemovedOp[] = [];
        const addedBatch: AddedOp[] = [];

        for (const op of chunk.ops) {
          if (op.type === 'removed') {
            removedBatch.push(op);
          } else {
            addedBatch.push(op);
          }
        }

        const maxLen = Math.max(removedBatch.length, addedBatch.length);
        for (let step = 0; step < maxLen; step += 1) {
          const rem = removedBatch[step];
          const add = addedBatch[step];

          if (rem && add) {
            lines.push({
              lineNumberLeft: rem.leftIndex + 1,
              lineNumberRight: add.rightIndex + 1,
              type: 'modified',
              contentLeft: this.getLineAt(leftLines, rem.leftIndex),
              contentRight: this.getLineAt(rightLines, add.rightIndex),
            });
          } else if (rem) {
            lines.push({
              lineNumberLeft: rem.leftIndex + 1,
              lineNumberRight: null,
              type: 'removed',
              contentLeft: this.getLineAt(leftLines, rem.leftIndex),
              contentRight: '',
            });
          } else if (add) {
            lines.push({
              lineNumberLeft: null,
              lineNumberRight: add.rightIndex + 1,
              type: 'added',
              contentLeft: '',
              contentRight: this.getLineAt(rightLines, add.rightIndex),
            });
          }
        }
      }
    }

    let totalAdded = 0;
    let totalRemoved = 0;
    let totalModified = 0;
    let totalUnchanged = 0;

    for (const line of lines) {
      if (line.type === 'added') {
        totalAdded += 1;
      } else if (line.type === 'removed') {
        totalRemoved += 1;
      } else if (line.type === 'modified') {
        totalModified += 1;
      } else {
        totalUnchanged += 1;
      }
    }

    const hasDifferences = totalAdded > 0 || totalRemoved > 0 || totalModified > 0;

    return {
      lines,
      summary: {
        totalAdded,
        totalRemoved,
        totalModified,
        totalUnchanged,
        hasDifferences,
      },
    };
  };

  public compare = (
    leftResult: ExecutionResult | null,
    rightResult: ExecutionResult | null,
  ): ResponseDiffResult => {
    const meta = this.computeMetaDiff(
      leftResult
        ? {
            status: leftResult.status,
            statusText: leftResult.statusText,
            durationMs: leftResult.durationMs,
            sizeBytes: leftResult.sizeBytes,
          }
        : null,
      rightResult
        ? {
            status: rightResult.status,
            statusText: rightResult.statusText,
            durationMs: rightResult.durationMs,
            sizeBytes: rightResult.sizeBytes,
          }
        : null,
    );

    const headers = this.computeHeaderDiff(
      leftResult?.headers ?? {},
      rightResult?.headers ?? {},
    );

    const bodyLeftText = this.formatPayload(leftResult?.data);
    const bodyRightText = this.formatPayload(rightResult?.data);
    const body = this.computeTextDiff(bodyLeftText, bodyRightText);

    const hasHeaderDiff = headers.some((h) => h.type !== 'unchanged');
    const hasMetaDiff = !meta.statusEqual;
    const hasDifferences = body.summary.hasDifferences || hasHeaderDiff || hasMetaDiff;

    const summary: DiffSummary = {
      totalAdded: body.summary.totalAdded,
      totalRemoved: body.summary.totalRemoved,
      totalModified: body.summary.totalModified,
      totalUnchanged: body.summary.totalUnchanged,
      hasDifferences,
    };

    return {
      meta,
      headers,
      body,
      summary,
    };
  };
}

export { JsonDiffService };
