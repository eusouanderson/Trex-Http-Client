import { computed, ref, watch } from 'vue';
import type {
  CollectionRunItemResult,
  CollectionRunReport,
  ICollectionRunnerService,
} from '../interfaces';
import { CollectionRunnerService } from '../collection-runner.service';
import type {
  CollectionRunnerModalProps,
  UseCollectionRunnerModalReturn,
} from './interfaces';

const useCollectionRunnerModal = (
  props: CollectionRunnerModalProps,
  emit: (e: 'close') => void,
  customRunnerService?: ICollectionRunnerService,
): UseCollectionRunnerModalReturn => {
  const runner = customRunnerService ?? new CollectionRunnerService();

  const isRunning = ref<boolean>(false);
  const isFinished = ref<boolean>(false);
  const currentIndex = ref<number>(0);
  const itemsResults = ref<CollectionRunItemResult[]>([]);
  const report = ref<CollectionRunReport | null>(null);
  let abortController: AbortController | null = null;

  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        itemsResults.value = [];
        report.value = null;
        isFinished.value = false;
        isRunning.value = false;
        currentIndex.value = 0;
      }
    },
  );

  const totalRequests = computed<number>(() => {
    if (!props.collection) {
      return 0;
    }
    return props.collection.items.filter((item) => item.type === 'request').length;
  });

  const progressPercentage = computed<number>(() => {
    if (totalRequests.value === 0) {
      return 0;
    }
    return Math.min(100, Math.round((itemsResults.value.length / totalRequests.value) * 100));
  });

  const passedCount = computed<number>(() => {
    return itemsResults.value.filter(
      (r) =>
        r.status !== undefined &&
        r.status >= 200 &&
        r.status < 400 &&
        r.error === undefined &&
        (r.tests.length === 0 || r.tests.every((t) => t.passed)),
    ).length;
  });

  const failedCount = computed<number>(() => {
    return itemsResults.value.length - passedCount.value;
  });

  const totalDurationMs = computed<number>(() => {
    if (report.value) {
      return report.value.totalDurationMs;
    }
    return itemsResults.value.reduce((acc, curr) => acc + curr.durationMs, 0);
  });

  const startRun = async (): Promise<void> => {
    if (!props.collection) {
      return;
    }

    isRunning.value = true;
    isFinished.value = false;
    itemsResults.value = [];
    report.value = null;
    currentIndex.value = 0;
    abortController = new AbortController();

    try {
      const runReport = await runner.run(
        props.collection,
        (itemResult, index) => {
          currentIndex.value = index;
          itemsResults.value.push(itemResult);
        },
        abortController.signal,
      );
      report.value = runReport;
    } finally {
      isRunning.value = false;
      isFinished.value = true;
    }
  };

  const stopRun = (): void => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isRunning.value = false;
  };

  const close = (): void => {
    stopRun();
    emit('close');
  };

  return {
    isRunning,
    isFinished,
    currentIndex,
    totalRequests,
    progressPercentage,
    passedCount,
    failedCount,
    totalDurationMs,
    itemsResults,
    report,
    startRun,
    stopRun,
    close,
  };
};

export { useCollectionRunnerModal };

