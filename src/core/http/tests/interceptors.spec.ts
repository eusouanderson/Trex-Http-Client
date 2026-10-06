import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTrexClient } from '../index';
import type { TrexRequestConfig, TrexResponse } from '../interfaces';

describe('TrexClient - Interceptors', () => {
  const mockFetch = vi.fn<typeof fetch>();

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should execute request interceptor to modify headers', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    client.interceptors.request.use((config: TrexRequestConfig) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: 'Bearer trex-token-123',
        },
      };
    });

    await client.get('/protected');

    const calledInit = mockFetch.mock.calls[0]?.[1];
    const calledHeaders = calledInit?.headers as Record<string, string> | undefined;
    expect(calledHeaders?.Authorization).toBe('Bearer trex-token-123');
  });

  it('should support async request interceptors in order', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    client.interceptors.request.use(async (config: TrexRequestConfig) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return {
        ...config,
        headers: {
          ...config.headers,
          'X-Step-One': 'done',
        },
      };
    });

    client.interceptors.request.use((config: TrexRequestConfig) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          'X-Step-Two': 'done',
        },
      };
    });

    await client.get('/steps');

    const calledInit = mockFetch.mock.calls[0]?.[1];
    const calledHeaders = calledInit?.headers as Record<string, string> | undefined;
    expect(calledHeaders?.['X-Step-One']).toBe('done');
    expect(calledHeaders?.['X-Step-Two']).toBe('done');
  });

  it('should allow ejecting a request interceptor', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const interceptorId = client.interceptors.request.use((config: TrexRequestConfig) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          'X-Should-Not-Exist': 'true',
        },
      };
    });

    client.interceptors.request.eject(interceptorId);

    await client.get('/ejected');

    const calledInit = mockFetch.mock.calls[0]?.[1];
    const calledHeaders = calledInit?.headers as Record<string, string> | undefined;
    expect(calledHeaders?.['X-Should-Not-Exist']).toBeUndefined();
  });

  it('should execute response interceptor to transform response data', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ rawName: 'diplodocus' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    client.interceptors.response.use((response: TrexResponse) => {
      const data = response.data as { rawName: string };
      return {
        ...response,
        data: {
          name: data.rawName.toUpperCase(),
        },
      };
    });

    const result = await client.get<{ name: string }>('/dino');

    expect(result).toEqual({ name: 'DIPLODOCUS' });
  });

  it('should support error handling in response interceptor', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const mockErrorHandler = vi.fn().mockImplementation((error: unknown) => {
      return { recovered: true, original: error };
    });

    client.interceptors.response.use(
      (response: TrexResponse) => response,
      mockErrorHandler,
    );

    const result = await client.get('/unauthorized');

    expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    const recovered = result as { recovered: boolean };
    expect(recovered.recovered).toBe(true);
  });

  it('should support clear and forEach on interceptor manager', () => {
    const client = createTrexClient();
    client.interceptors.request.use((c) => c);
    client.interceptors.request.use((c) => c);

    const items: unknown[] = [];
    client.interceptors.request.forEach((item) => {
      items.push(item);
    });
    expect(items).toHaveLength(2);

    client.interceptors.request.clear();
    expect(client.interceptors.request.getItems()).toHaveLength(0);
  });

  it('should call rejected handler when request interceptor throws', async () => {
    const client = createTrexClient({ fetch: mockFetch });
    const mockRejected = vi.fn();

    client.interceptors.request.use(
      () => {
        throw new Error('Interceptor failed');
      },
      mockRejected,
    );

    await expect(client.get('https://api.dinossauro.dev/fail')).rejects.toThrow('Interceptor failed');
    expect(mockRejected).toHaveBeenCalledTimes(1);
  });

  it('should handle error when response rejected interceptor throws', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 500, statusText: 'Error' }));
    const client = createTrexClient({ fetch: mockFetch });

    client.interceptors.response.use(
      (res) => res,
      () => {
        throw new Error('Custom interceptor crash');
      },
    );

    await expect(client.get('https://api.dinossauro.dev/error')).rejects.toThrow('Custom interceptor crash');
  });

  it('should abort immediately if signal is already aborted', async () => {
    const client = createTrexClient({ fetch: mockFetch });
    const controller = new AbortController();
    controller.abort();

    await expect(
      client.get('https://api.dinossauro.dev/pre-aborted', { signal: controller.signal }),
    ).rejects.toThrow();
  });
});

