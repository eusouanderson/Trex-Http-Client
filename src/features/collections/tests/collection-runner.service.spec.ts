import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Collection } from '../interfaces';
import { CollectionRunnerService } from '../collection-runner.service';

describe('CollectionRunnerService', () => {
  const mockFetch = vi.fn<typeof fetch>();
  let runner: CollectionRunnerService;

  beforeEach(() => {
    mockFetch.mockReset();
    runner = new CollectionRunnerService(mockFetch);
  });

  it('should run empty collection and return zero totals', async () => {
    const col: Collection = {
      id: 'col-empty',
      name: 'Empty Col',
      items: [],
    };

    const report = await runner.run(col);
    expect(report.collectionId).toBe('col-empty');
    expect(report.collectionName).toBe('Empty Col');
    expect(report.total).toBe(0);
    expect(report.passed).toBe(0);
    expect(report.failed).toBe(0);
    expect(report.items).toEqual([]);
  });

  it('should run collection with multiple requests and invoke progress callback', async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, name: 'T-Rex' }), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 2, name: 'Velociraptor' }), {
          status: 201,
          statusText: 'Created',
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const col: Collection = {
      id: 'col-1',
      name: 'Dino API',
      items: [
        {
          id: 'req-1',
          name: 'Get T-Rex',
          type: 'request',
          method: 'GET',
          url: 'https://api.dino.dev/trex',
          headers: { Accept: 'application/json' },
          params: { page: '1' },
        },
        {
          id: 'req-2',
          name: 'Create Raptor',
          type: 'request',
          method: 'POST',
          url: 'https://api.dino.dev/raptor',
          body: JSON.stringify({ name: 'Velociraptor' }),
        },
      ],
    };

    const progressCalls: number[] = [];
    const report = await runner.run(col, (_itemResult, index, total) => {
      progressCalls.push(index);
      expect(total).toBe(2);
    });

    expect(report.total).toBe(2);
    expect(report.passed).toBe(2);
    expect(report.failed).toBe(0);
    expect(report.items).toHaveLength(2);
    expect(report.items[0]?.status).toBe(200);
    expect(report.items[1]?.status).toBe(201);
    expect(progressCalls).toEqual([0, 1]);
  });

  it('should execute test script and record assertions', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'active', count: 5 }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const col: Collection = {
      id: 'col-tests',
      name: 'Test Col',
      items: [
        {
          id: 'req-test',
          name: 'Test Endpoint',
          type: 'request',
          method: 'GET',
          url: 'https://api.dino.dev/test',
          testScript: `
            tx.test("Status code is 200", () => {
              tx.response.to.have.status(200);
            });
            tx.test("Failing test", () => {
              tx.response.to.have.status(201);
            });
          `,
        },
      ],
    };

    const report = await runner.run(col);
    expect(report.total).toBe(1);
    expect(report.passed).toBe(0);
    expect(report.failed).toBe(1);
    expect(report.items[0]?.tests).toHaveLength(2);
    expect(report.items[0]?.tests[0]?.passed).toBe(true);
    expect(report.items[0]?.tests[1]?.passed).toBe(false);
  });

  it('should update active environment variables when script mutates them', async () => {
    const { useEnvironments } = await import('../../environments');
    const { createEnvironment, setActiveEnvironment } = useEnvironments();
    const env = createEnvironment('Runner Env');
    env.variables = [
      { id: 'v1', key: 'token', value: 'initial-token', enabled: true },
      { id: 'v2', key: 'inactive', value: 'off', enabled: false },
    ];
    setActiveEnvironment(env.id);

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ new_token: 'refreshed-token', user_id: '42' }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const col: Collection = {
      id: 'col-env-test',
      name: 'Env Col',
      items: [
        {
          id: 'req-env',
          name: 'Refresh Token',
          type: 'request',
          method: 'POST',
          url: 'https://api.dino.dev/refresh',
          testScript: `
            const data = tx.response.json();
            tx.environment.set("token", data.new_token);
            tx.environment.set("user_id", data.user_id);
          `,
        },
      ],
    };

    const report = await runner.run(col);
    expect(report.passed).toBe(1);

    const updatedEnv = useEnvironments().activeEnvironment.value;
    expect(updatedEnv?.variables.find((v) => v.key === 'token')?.value).toBe('refreshed-token');
    expect(updatedEnv?.variables.find((v) => v.key === 'user_id')?.value).toBe('42');
  });

  it('should handle request errors gracefully and mark failed', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const col: Collection = {
      id: 'col-err',
      name: 'Error Col',
      items: [
        {
          id: 'req-fail',
          name: 'Failing Req',
          type: 'request',
          method: 'GET',
          url: 'https://api.dino.dev/fail',
        },
      ],
    };

    const report = await runner.run(col);
    expect(report.total).toBe(1);
    expect(report.passed).toBe(0);
    expect(report.failed).toBe(1);
    expect(report.items[0]?.status).toBe(0);
    expect(report.items[0]?.error).toContain('Network error');
  });

  it('should abort execution when signal is aborted', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        statusText: 'OK',
      }),
    );

    const col: Collection = {
      id: 'col-abort',
      name: 'Abort Col',
      items: [
        { id: 'req-1', name: 'Req 1', type: 'request', url: 'https://api.dino.dev/1' },
        { id: 'req-2', name: 'Req 2', type: 'request', url: 'https://api.dino.dev/2' },
        { id: 'req-3', name: 'Req 3', type: 'request', url: 'https://api.dino.dev/3' },
      ],
    };

    const controller = new AbortController();
    const report = await runner.run(
      col,
      (_result, index) => {
        if (index === 0) {
          controller.abort();
        }
      },
      controller.signal,
    );

    expect(report.total).toBe(3);
    expect(report.items).toHaveLength(1);
  });

  it('should ignore non-request items like folders', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        statusText: 'OK',
      }),
    );

    const col: Collection = {
      id: 'col-folder',
      name: 'Folder Col',
      items: [
        { id: 'f-1', name: 'Folder', type: 'folder' },
        { id: 'r-1', name: 'Req', type: 'request', url: 'https://api.dino.dev/req' },
      ],
    };

    const report = await runner.run(col);
    expect(report.total).toBe(1);
    expect(report.items).toHaveLength(1);
  });

  it('should fallback to GET method and empty string url when missing', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('OK', { status: 200, statusText: 'OK' }),
    );

    const col: Collection = {
      id: 'col-fallback',
      name: 'Fallback Col',
      items: [
        {
          id: 'req-no-url',
          name: 'No URL Item',
          type: 'request',
        },
      ],
    };

    const report = await runner.run(col);
    expect(report.items[0]?.method).toBe('GET');
    expect(report.items[0]?.url).toBe('');
  });
});
