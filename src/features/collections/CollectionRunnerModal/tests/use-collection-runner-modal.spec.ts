import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  Collection,
  CollectionRunItemResult,
  CollectionRunReport,
  ICollectionRunnerService,
} from '../../interfaces';
import { useCollectionRunnerModal } from '../use-collection-runner-modal';
import type { CollectionRunnerModalProps } from '../interfaces';

describe('useCollectionRunnerModal', () => {
  const mockCollection: Collection = {
    id: 'col-1',
    name: 'Runner Collection',
    items: [
      { id: 'req-1', name: 'Req 1', type: 'request', method: 'GET', url: 'https://api.dino.dev/1' },
      { id: 'req-2', name: 'Req 2', type: 'request', method: 'POST', url: 'https://api.dino.dev/2' },
    ],
  };

  const mockReport: CollectionRunReport = {
    collectionId: 'col-1',
    collectionName: 'Runner Collection',
    total: 2,
    passed: 2,
    failed: 0,
    totalDurationMs: 45,
    items: [
      {
        itemId: 'req-1',
        name: 'Req 1',
        method: 'GET',
        url: 'https://api.dino.dev/1',
        status: 200,
        statusText: 'OK',
        durationMs: 20,
        tests: [],
      },
      {
        itemId: 'req-2',
        name: 'Req 2',
        method: 'POST',
        url: 'https://api.dino.dev/2',
        status: 201,
        statusText: 'Created',
        durationMs: 25,
        tests: [],
      },
    ],
  };

  let runMock: ReturnType<typeof vi.fn>;
  let mockRunnerService: ICollectionRunnerService;

  beforeEach(() => {
    runMock = vi.fn(
      (
        _col: Collection,
        onProgress?: (result: CollectionRunItemResult, index: number, total: number) => void,
      ): Promise<CollectionRunReport> => {
        mockReport.items.forEach((item, idx) => {
          if (onProgress !== undefined) {
            onProgress(item, idx, mockReport.total);
          }
        });
        return Promise.resolve(mockReport);
      },
    );
    mockRunnerService = {
      run: runMock,
    };
  });

  it('should initialize with default states and calculate counts', () => {
    const props: CollectionRunnerModalProps = {
      isOpen: true,
      collection: mockCollection,
    };
    const emit = vi.fn();

    const composable = useCollectionRunnerModal(props, emit, mockRunnerService);

    expect(composable.isRunning.value).toBe(false);
    expect(composable.isFinished.value).toBe(false);
    expect(composable.totalRequests.value).toBe(2);
    expect(composable.progressPercentage.value).toBe(0);
    expect(composable.passedCount.value).toBe(0);
    expect(composable.failedCount.value).toBe(0);
    expect(composable.totalDurationMs.value).toBe(0);
  });

  it('should execute collection run and update progress and report', async () => {
    const props: CollectionRunnerModalProps = {
      isOpen: true,
      collection: mockCollection,
    };
    const emit = vi.fn();

    const composable = useCollectionRunnerModal(props, emit, mockRunnerService);

    await composable.startRun();

    expect(runMock).toHaveBeenCalledTimes(1);
    expect(composable.isRunning.value).toBe(false);
    expect(composable.isFinished.value).toBe(true);
    expect(composable.itemsResults.value).toHaveLength(2);
    expect(composable.progressPercentage.value).toBe(100);
    expect(composable.passedCount.value).toBe(2);
    expect(composable.failedCount.value).toBe(0);
    expect(composable.totalDurationMs.value).toBe(45);
    expect(composable.report.value).toEqual(mockReport);
  });

  it('should abort run when stopRun is called', async () => {
    let capturedSignal: AbortSignal | undefined;
    runMock = vi.fn(
      (_col: Collection, _onProgress?: unknown, signal?: AbortSignal): Promise<CollectionRunReport> => {
        capturedSignal = signal;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockReport);
          }, 50);
        });
      },
    );
    mockRunnerService = { run: runMock };

    const props: CollectionRunnerModalProps = {
      isOpen: true,
      collection: mockCollection,
    };
    const emit = vi.fn();

    const composable = useCollectionRunnerModal(props, emit, mockRunnerService);

    const runPromise = composable.startRun();
    expect(composable.isRunning.value).toBe(true);

    composable.stopRun();
    expect(capturedSignal?.aborted).toBe(true);
    await runPromise;
  });

  it('should close and emit close event', () => {
    const props: CollectionRunnerModalProps = {
      isOpen: true,
      collection: mockCollection,
    };
    const emit = vi.fn();

    const composable = useCollectionRunnerModal(props, emit, mockRunnerService);

    composable.close();
    expect(emit).toHaveBeenCalledWith('close');
  });

  it('should handle startRun with null collection gracefully', async () => {
    const props: CollectionRunnerModalProps = {
      isOpen: true,
      collection: null,
    };
    const emit = vi.fn();

    const composable = useCollectionRunnerModal(props, emit, mockRunnerService);

    await composable.startRun();
    expect(runMock).not.toHaveBeenCalled();
    expect(composable.totalRequests.value).toBe(0);
    expect(composable.progressPercentage.value).toBe(0);
  });

  it('should reset state on isOpen prop change via reactive props', async () => {
    const { reactive } = await import('vue');
    const props = reactive<CollectionRunnerModalProps>({
      isOpen: false,
      collection: mockCollection,
    });
    const emit = vi.fn();

    const composable = useCollectionRunnerModal(props, emit, mockRunnerService);

    props.isOpen = true;
    await new Promise((r) => setTimeout(r, 10));

    expect(composable.itemsResults.value).toEqual([]);
    expect(composable.isFinished.value).toBe(false);

    props.isOpen = false;
    await new Promise((r) => setTimeout(r, 10));
  });

  it('should calculate failedCount when status >= 400 or error occurs or test fails', () => {
    const props: CollectionRunnerModalProps = {
      isOpen: true,
      collection: mockCollection,
    };
    const emit = vi.fn();

    const composable = useCollectionRunnerModal(props, emit, mockRunnerService);

    composable.itemsResults.value = [
      {
        itemId: '1',
        name: 'Req 1',
        method: 'GET',
        url: 'http://a',
        status: 500,
        durationMs: 10,
        tests: [],
      },
      {
        itemId: '2',
        name: 'Req 2',
        method: 'GET',
        url: 'http://b',
        status: 200,
        error: 'Network error',
        durationMs: 10,
        tests: [],
      },
      {
        itemId: '3',
        name: 'Req 3',
        method: 'GET',
        url: 'http://c',
        status: 200,
        durationMs: 10,
        tests: [{ name: 't1', passed: false }],
      },
    ];

    expect(composable.passedCount.value).toBe(0);
    expect(composable.failedCount.value).toBe(3);
    expect(composable.totalDurationMs.value).toBe(30);
  });
});

