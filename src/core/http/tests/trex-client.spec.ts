import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTrexClient, TrexHttpError, TrexError } from '../index';

describe('TrexClient', () => {
  const mockFetch = vi.fn<typeof fetch>();

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should make successful GET request with parsed JSON', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'T-Rex' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const user = await client.get<{ id: number; name: string }>('/users/1');

    expect(user).toEqual({ id: 1, name: 'T-Rex' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0]?.[0];
    const calledInit = mockFetch.mock.calls[0]?.[1];
    expect(calledUrl).toBe('https://api.dinossauro.dev/users/1');
    expect(calledInit?.method).toBe('GET');
  });

  it('should correctly join baseURL and endpoint with varying slashes', async () => {
    mockFetch.mockImplementation(
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev/',
      fetch: mockFetch,
    });

    await client.get('/items');
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://api.dinossauro.dev/items',
      expect.objectContaining({ method: 'GET' }),
    );

    await client.get('items');
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://api.dinossauro.dev/items',
      expect.objectContaining({ method: 'GET' }),
    );

    await client.get('https://other-domain.org/custom');
    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      'https://other-domain.org/custom',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should serialize query params correctly', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await client.get('/fossils', {
      params: {
        page: 1,
        active: true,
        empty: undefined,
        ignored: null,
        tags: ['jurassic', 'cretaceous'],
      },
    });

    const calledUrl = mockFetch.mock.calls[0]?.[0];
    expect(calledUrl).toBe(
      'https://api.dinossauro.dev/fossils?page=1&active=true&tags=jurassic&tags=cretaceous',
    );
  });

  it('should send JSON body and set Content-Type header on POST', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 2 }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await client.post('/fossils', { name: 'Velociraptor' });

    const calledUrl = mockFetch.mock.calls[0]?.[0];
    const calledInit = mockFetch.mock.calls[0]?.[1];
    const calledHeaders = calledInit?.headers as Record<string, string> | undefined;

    expect(calledUrl).toBe('https://api.dinossauro.dev/fossils');
    expect(calledInit?.method).toBe('POST');
    expect(calledInit?.body).toBe(JSON.stringify({ name: 'Velociraptor' }));
    expect(calledHeaders?.['Content-Type']).toBe('application/json');
  });

  it('should not set Content-Type header when body is FormData', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ uploaded: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const formData = new FormData();
    formData.append('species', 'Triceratops');

    await client.post('/upload', formData);

    const calledInit = mockFetch.mock.calls[0]?.[1];
    const calledHeaders = calledInit?.headers as Record<string, string> | undefined;

    expect(calledInit?.body).toBe(formData);
    expect(calledHeaders?.['Content-Type']).toBeUndefined();
  });

  it('should throw TrexHttpError on 4xx/5xx responses', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Dino not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(client.get('/dinos/999')).rejects.toThrow(TrexHttpError);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Dino not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    try {
      await client.get('/dinos/999');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(TrexHttpError);
      const httpError = error as TrexHttpError;
      expect(httpError.status).toBe(404);
      expect(httpError.statusText).toBe('Not Found');
      expect(httpError.code).toBe('HTTP_ERROR');
      expect(httpError.data).toEqual({ message: 'Dino not found' });
    }
  });

  it('should timeout and abort request when duration exceeds timeout config', async () => {
    mockFetch.mockImplementation(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise((_, reject) => {
          if (init?.signal !== undefined && init.signal !== null) {
            init.signal.addEventListener('abort', () => {
              const abortErr = new Error('The operation was aborted');
              abortErr.name = 'AbortError';
              reject(abortErr);
            });
          }
        }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      timeout: 50,
      fetch: mockFetch,
    });

    await expect(client.get('/slow')).rejects.toThrow(TrexError);
    try {
      await client.get('/slow');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(TrexError);
      const trexError = error as TrexError;
      expect(trexError.code).toBe('TIMEOUT');
    }
  });

  it('should handle manual cancellation with consumer AbortController', async () => {
    const controller = new AbortController();

    mockFetch.mockImplementation(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise((_, reject) => {
          if (init?.signal !== undefined && init.signal !== null) {
            init.signal.addEventListener('abort', () => {
              const abortErr = new Error('The operation was aborted');
              abortErr.name = 'AbortError';
              reject(abortErr);
            });
          }
        }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const promise = client.get('/cancelable', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow(TrexError);
    try {
      await promise;
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(TrexError);
      const trexError = error as TrexError;
      expect(trexError.code).toBe('ABORTED');
    }
  });

  it('should support string, blob, and URLSearchParams post bodies', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const client = createTrexClient({ fetch: mockFetch });

    await client.post('https://api.dinossauro.dev/str', 'raw text');
    expect(mockFetch.mock.calls[0]?.[1]?.body).toBe('raw text');

    const blob = new Blob(['sample-blob']);
    await client.post('https://api.dinossauro.dev/blob', blob);
    expect(mockFetch.mock.calls[1]?.[1]?.body).toBe(blob);

    const params = new URLSearchParams({ k: 'v' });
    await client.post('https://api.dinossauro.dev/params', params);
    expect(mockFetch.mock.calls[2]?.[1]?.body).toBe(params);
  });

  it('should use global fetch when fetch option is omitted in client config', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ globalFetch: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
    });

    const result = await client.get('/global-fetch');
    expect(result).toEqual({ globalFetch: true });
    globalThis.fetch = originalFetch;
  });

  it('should clear timeout in finally block when request fails with error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection reset'));

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(
      client.get('/fail-timeout', { timeout: 10000 }),
    ).rejects.toThrow('Connection reset');
  });

  it('should return recovered value when error interceptor returns non-error data', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('Not Found', { status: 404, statusText: 'Not Found' }),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    client.interceptors.response.use(
      (res) => res,
      () => ({ recovered: true }),
    );

    const result = await client.get<{ recovered: boolean }>('/not-found');
    expect(result).toEqual({ recovered: true });
  });

  it('should remove abort event listener in finally block when consumer signal and timeout are passed on error', async () => {
    const controller = new AbortController();
    mockFetch.mockRejectedValueOnce(new Error('Aborted'));

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(
      client.get('/fail-signal', { signal: controller.signal, timeout: 5000 }),
    ).rejects.toThrow('Aborted');
  });
});

