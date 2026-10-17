import type { Ref, ComputedRef } from 'vue';
import type { Collection, CollectionRunItemResult, CollectionRunReport } from '../interfaces';

interface CollectionRunnerModalProps {
  isOpen: boolean;
  collection: Collection | null;
}

type CollectionRunnerModalEmits = (e: 'close') => void;

interface UseCollectionRunnerModalReturn {
  isRunning: Ref<boolean>;
  isFinished: Ref<boolean>;
  currentIndex: Ref<number>;
  totalRequests: Ref<number>;
  progressPercentage: ComputedRef<number>;
  passedCount: ComputedRef<number>;
  failedCount: ComputedRef<number>;
  totalDurationMs: ComputedRef<number>;
  itemsResults: Ref<CollectionRunItemResult[]>;
  report: Ref<CollectionRunReport | null>;
  startRun: () => Promise<void>;
  stopRun: () => void;
  close: () => void;
}

export type {
  CollectionRunnerModalProps,
  CollectionRunnerModalEmits,
  UseCollectionRunnerModalReturn,
};

