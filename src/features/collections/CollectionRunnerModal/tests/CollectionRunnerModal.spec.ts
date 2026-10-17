import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CollectionRunnerModal from '../index.vue';
import type { Collection, CollectionRunItemResult } from '../../interfaces';
import { CollectionRunnerService } from '../../collection-runner.service';

describe('CollectionRunnerModal Component', () => {
  const mockCollection: Collection = {
    id: 'col-1',
    name: 'Runner Collection',
    items: [
      { id: 'req-1', name: 'Req 1', type: 'request', method: 'GET', url: 'https://api.dino.dev/1' },
      { id: 'req-2', name: 'Req 2', type: 'request', url: 'https://api.dino.dev/2' },
    ],
  };

  it('should not render anything when isOpen is false', () => {
    const wrapper = mount(CollectionRunnerModal, {
      props: {
        isOpen: false,
        collection: mockCollection,
      },
    });

    expect(wrapper.find('div.fixed').exists()).toBe(false);
  });

  it('should render modal content when isOpen is true', () => {
    const wrapper = mount(CollectionRunnerModal, {
      props: {
        isOpen: true,
        collection: mockCollection,
      },
    });

    expect(wrapper.find('h2').text()).toContain('Runner Collection');
    expect(wrapper.text()).toContain('2 requisições');
    expect(wrapper.text()).toContain('Req 1');
    expect(wrapper.text()).toContain('Req 2');
  });

  it('should emit close when close button is clicked', async () => {
    const wrapper = mount(CollectionRunnerModal, {
      props: {
        isOpen: true,
        collection: mockCollection,
      },
    });

    const closeBtn = wrapper.find('button[title="Fechar"]');
    await closeBtn.trigger('click');

    expect(wrapper.emitted('close')).toBeDefined();
  });

  it('should handle start button and bottom close button clicks', async () => {
    const wrapper = mount(CollectionRunnerModal, {
      props: {
        isOpen: true,
        collection: mockCollection,
      },
    });

    const startBtn = wrapper.findAll('button').find((b) => b.text().includes('Iniciar Execução'));
    expect(startBtn).toBeDefined();
    await startBtn?.trigger('click');

    const bottomCloseBtn = wrapper.findAll('button').find((b) => b.text().includes('Fechar') && b.attributes('title') === undefined);
    expect(bottomCloseBtn).toBeDefined();
    await bottomCloseBtn?.trigger('click');
    expect(wrapper.emitted('close')).toBeDefined();
  });

  it('should render failed badge and test failures when run has failed requests', async () => {
    const runSpy = vi.spyOn(CollectionRunnerService.prototype, 'run').mockImplementation(
      (col, onProgress) => {
        const successItem: CollectionRunItemResult = {
          itemId: 'req-1',
          name: 'Req 1',
          method: 'GET',
          url: 'https://api.dino.dev/1',
          status: 200,
          statusText: 'OK',
          durationMs: 25,
          sizeBytes: 150,
          tests: [{ name: 'Status is 200', passed: true }],
        };
        const redirectItem: CollectionRunItemResult = {
          itemId: 'req-2',
          name: 'Req 2',
          method: 'POST',
          url: 'https://api.dino.dev/2',
          status: 302,
          statusText: 'Found',
          durationMs: 15,
          sizeBytes: 80,
          tests: [],
        };
        const failedItem: CollectionRunItemResult = {
          itemId: 'req-3',
          name: 'Req 3',
          method: 'DELETE',
          url: 'https://api.dino.dev/3',
          status: 500,
          statusText: 'Internal Server Error',
          durationMs: 45,
          sizeBytes: 120,
          error: 'Server error occurred',
          tests: [
            { name: 'Status check', passed: false, error: 'expected 200 got 500' },
          ],
        };
        const noStatusItem: CollectionRunItemResult = {
          itemId: 'req-4',
          name: 'Req 4',
          method: 'PATCH',
          url: 'https://api.dino.dev/4',
          status: 0,
          statusText: '',
          durationMs: 5,
          sizeBytes: 0,
          error: 'Aborted',
          tests: [],
        };

        onProgress?.(successItem, 0, 4);
        onProgress?.(redirectItem, 1, 4);
        onProgress?.(failedItem, 2, 4);
        onProgress?.(noStatusItem, 3, 4);

        return Promise.resolve({
          collectionId: col.id,
          collectionName: col.name,
          total: 4,
          passed: 2,
          failed: 2,
          totalDurationMs: 90,
          items: [successItem, redirectItem, failedItem, noStatusItem],
        });
      },
    );

    const wrapper = mount(CollectionRunnerModal, {
      props: {
        isOpen: true,
        collection: mockCollection,
      },
    });

    const startBtn = wrapper.findAll('button').find((b) => b.text().includes('Iniciar Execução'));
    await startBtn?.trigger('click');

    expect(wrapper.text()).toContain('2 falharam');
    expect(wrapper.text()).toContain('500 Internal Server Error');
    expect(wrapper.text()).toContain('Server error occurred');
    expect(wrapper.text()).toContain('expected 200 got 500');
    expect(wrapper.text()).toContain('Executar Novamente');

    runSpy.mockRestore();
  });

  it('should allow stopping an in-progress execution', async () => {
    let resolveRun: () => void = () => undefined;
    const runSpy = vi.spyOn(CollectionRunnerService.prototype, 'run').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRun = (): void => {
            resolve({
              collectionId: 'col-1',
              collectionName: 'Runner Collection',
              total: 1,
              passed: 1,
              failed: 0,
              totalDurationMs: 10,
              items: [],
            });
          };
        }),
    );

    const wrapper = mount(CollectionRunnerModal, {
      props: {
        isOpen: true,
        collection: mockCollection,
      },
    });

    const startBtn = wrapper.findAll('button').find((b) => b.text().includes('Iniciar Execução'));
    await startBtn?.trigger('click');

    const stopBtn = wrapper.findAll('button').find((b) => b.text().includes('Parar'));
    expect(stopBtn).toBeDefined();
    await stopBtn?.trigger('click');

    resolveRun();
    runSpy.mockRestore();
  });
});


