import { JsonDiffService } from './json-diff.service';
import type {
  DiffLine,
  DiffOperation,
  DiffSummary,
  HeaderDiffItem,
  MetaDiff,
  ResponseDiffResult,
  TextDiffResult,
} from './interfaces';

const createJsonDiffService = (): JsonDiffService => new JsonDiffService();

export { JsonDiffService, createJsonDiffService };
export type {
  DiffLine,
  DiffOperation,
  DiffSummary,
  HeaderDiffItem,
  MetaDiff,
  ResponseDiffResult,
  TextDiffResult,
};

