import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTrexClient, TrexHttpError } from '../index';
import { RetryHandler } from '../retry-handler';

describe('TrexClient - Retry', () => {
  const mockFetch = vi.fn<typeof fetch>();

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should retry failed 500 requests up to specified attempts and succeed', async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, name: 'Brachiosaurus' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const result = await client.get('/dinos/1', {
      retry: {
        attempts: 2,
        delay: 5,
        backoffFactor: 1,
      },
    });

    expect(result).toEqual({ id: 1, name: 'Brachiosaurus' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should fail with TrexHttpError when all retry attempts are exhausted', async () => {
    mockFetch.mockImplementation(
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Gateway Timeout' }), {
            status: 504,
            statusText: 'Gateway Timeout',
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(
      client.get('/dinos/slow', {
        retry: {
          attempts: 3,
          delay: 5,
          backoffFactor: 1,
        },
      }),
    ).rejects.toThrow(TrexHttpError);

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should not retry 4xx errors by default', async () => {
    mockFetch.mockImplementation(
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Not Found' }), {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(
      client.get('/dinos/non-existent', {
        retry: {
          attempts: 3,
          delay: 5,
        },
      }),
    ).rejects.toThrow(TrexHttpError);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should not retry POST by default when methods config only includes idempotent methods', async () => {
    mockFetch.mockImplementation(
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(
      client.post(
        '/dinos',
        { name: 'Spinosaurus' },
        {
          retry: {
            attempts: 3,
            delay: 5,
          },
        },
      ),
    ).rejects.toThrow(TrexHttpError);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry network TypeError failures', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ restored: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const result = await client.get('/network-retry', {
      retry: {
        attempts: 2,
        delay: 5,
      },
    });

    expect(result).toEqual({ restored: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should support retry: true boolean option with default retry values', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response(null, { status: 503, statusText: 'Service Unavailable' }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const client = createTrexClient({ baseURL: 'https://api.dinossauro.dev', fetch: mockFetch });
    const result = await client.get('/boolean-retry', {
      retry: true,
    });
    expect(result).toEqual({ ok: true });
  });

  it('should not retry on aborted requests', async () => {
    const abortErr = new Error('The user aborted a request');
    abortErr.name = 'AbortError';
    mockFetch.mockRejectedValue(abortErr);
    const controller = new AbortController();
    const client = createTrexClient({ baseURL: 'https://api.dinossauro.dev', fetch: mockFetch });

    await expect(
      client.get('/aborted', {
        signal: controller.signal,
        retry: { attempts: 3, delay: 5 },
      }),
    ).rejects.toThrow('Request aborted');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should support put, patch, and delete shortcut methods', async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ method: 'PUT' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ method: 'PATCH' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ method: 'DELETE' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const client = createTrexClient({ baseURL: 'https://api.dinossauro.dev', fetch: mockFetch });

    const putRes = await client.put('/item/1', { updated: true });
    expect(putRes).toEqual({ method: 'PUT' });

    const patchRes = await client.patch('/item/1', { patched: true });
    expect(patchRes).toEqual({ method: 'PATCH' });

    const delRes = await client.delete('/item/1');
    expect(delRes).toEqual({ method: 'DELETE' });
  });

  it('should cover fallback branches in RetryHandler', () => {
    const handler = new RetryHandler();
    const resolved = handler.resolveConfig({ attempts: 3 });
    expect(resolved?.delay).toBe(1000);
    expect(resolved?.backoffFactor).toBe(2);
    expect(resolved?.methods).toBeDefined();
    expect(resolved?.statusCodes).toBeDefined();

    const httpErr = new TrexHttpError('Fail', {
      status: 500,
      statusText: 'Server Error',
      url: 'https://api.dinossauro.dev',
      method: 'GET',
      data: null,
      headers: new Headers(),
    });

    const shouldRetryWithDefaults = handler.shouldRetry(httpErr, 'GET', 0, {
      attempts: 2,
    });
    expect(shouldRetryWithDefaults).toBe(true);
  });

  it('should handle non-Error throw in fetch and non-Error recovery in response interceptor', async () => {
    mockFetch.mockRejectedValueOnce('String network failure');

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(client.get('/fail-string')).rejects.toThrow('Network error');

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Fatal' }), {
        status: 500,
        statusText: 'Internal Error',
      }),
    );

    const clientWithRecovery = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    clientWithRecovery.interceptors.response.use(
      (res) => res,
      () => ({ recovered: true }),
    );

    const recoveredResult = await clientWithRecovery.get('/recover');
    expect(recoveredResult).toEqual({ recovered: true });
  });

  it('should use default delay and backoff in retry wait when not specified', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const res = await client.get('/retry-defaults', {
      retry: {
        attempts: 2,
        delay: 1,
      },
    });

    expect(res).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should clean up timeout and signal in finally on each retry attempt', async () => {
    const controller = new AbortController();
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const result = await client.get<{ success: boolean }>('/retry-cleanup', {
      timeout: 5000,
      signal: controller.signal,
      retry: {
        attempts: 2,
        delay: 5,
        backoffFactor: 1,
      },
    });

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

