import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestTab } from '../interfaces';
import { RequestRunnerService } from '../request-runner.service';

describe('RequestRunnerService', () => {
  const mockFetch = vi.fn<typeof fetch>();
  let service: RequestRunnerService;

  beforeEach(() => {
    mockFetch.mockReset();
    service = new RequestRunnerService(mockFetch);
  });

  it('should execute GET request and return structured execution result', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ dino: 'Tyrannosaurus' }), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'paleo',
        },
      }),
    );

    const tab: RequestTab = {
      id: 'tab-1',
      name: 'Get Dino',
      method: 'GET',
      url: 'https://api.dino.dev/trex',
      params: [{ id: 'p1', key: 'era', value: 'cretaceous', enabled: true }],
      headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = await service.execute(tab);

    expect(result.status).toBe(200);
    expect(result.statusText).toBe('OK');
    expect(result.data).toEqual({ dino: 'Tyrannosaurus' });
    expect(result.headers['x-custom']).toBe('paleo');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeUndefined();

    const calledUrl = mockFetch.mock.calls[0]?.[0];
    expect(calledUrl).toBe('https://api.dino.dev/trex?era=cretaceous');
  });

  it('should send POST request with JSON body when bodyType is json', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 99 }), {
        status: 201,
        statusText: 'Created',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const tab: RequestTab = {
      id: 'tab-2',
      name: 'Create Dino',
      method: 'POST',
      url: 'https://api.dino.dev/fossils',
      params: [],
      headers: [],
      bodyType: 'json',
      body: '{"species":"Velociraptor"}',
      isDirty: false,
    };

    const result = await service.execute(tab);

    expect(result.status).toBe(201);
    expect(result.data).toEqual({ id: 99 });

    const calledInit = mockFetch.mock.calls[0]?.[1];
    expect(calledInit?.method).toBe('POST');
    expect(calledInit?.body).toBe('{"species":"Velociraptor"}');
  });

  it('should handle HTTP error status and capture response data', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Espécime extinto' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const tab: RequestTab = {
      id: 'tab-3',
      name: 'Missing Dino',
      method: 'GET',
      url: 'https://api.dino.dev/extinct',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = await service.execute(tab);

    expect(result.status).toBe(404);
    expect(result.statusText).toBe('Not Found');
    expect(result.data).toEqual({ message: 'Espécime extinto' });
  });

  it('should send plain text body and handle text response correctly', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('raw response text', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    const tab: RequestTab = {
      id: 'tab-text',
      name: 'Text Req',
      method: 'POST',
      url: 'https://api.dino.dev/text',
      params: [],
      headers: [],
      bodyType: 'text',
      body: 'simple plain text message',
      isDirty: false,
    };

    const result = await service.execute(tab);
    expect(result.status).toBe(200);
    expect(result.data).toBe('raw response text');
  });

  it('should handle json body with invalid json syntax by falling back to raw body', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const tab: RequestTab = {
      id: 'tab-invalid-json',
      name: 'Invalid JSON Req',
      method: 'POST',
      url: 'https://api.dino.dev/raw',
      params: [],
      headers: [],
      bodyType: 'json',
      body: '{ not valid json',
      isDirty: false,
    };

    const result = await service.execute(tab);
    expect(result.status).toBe(200);
  });

  it('should handle error with string data and non-Error throw', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('string error body', {
        status: 500,
        statusText: 'Internal Error',
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    const tab: RequestTab = {
      id: 'tab-err-string',
      name: 'Err String',
      method: 'GET',
      url: 'https://api.dino.dev/err',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const errResult = await service.execute(tab);
    expect(errResult.status).toBe(500);
    expect(errResult.data).toBe('string error body');

    mockFetch.mockRejectedValueOnce('Network crashed unexpectedly');
    const crashResult = await service.execute(tab);
    expect(crashResult.status).toBe(0);
    expect(crashResult.error).toBe('Network error');
  });

  it('should handle 204 response with null data and error with null data', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, {
        status: 204,
        statusText: 'No Content',
      }),
    );

    const tab: RequestTab = {
      id: 'tab-204',
      name: 'No Content',
      method: 'GET',
      url: 'https://api.dino.dev/empty',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const emptyResult = await service.execute(tab);
    expect(emptyResult.status).toBe(204);

    mockFetch.mockResolvedValueOnce(
      new Response(null, {
        status: 502,
        statusText: 'Bad Gateway',
      }),
    );

    const errorResult = await service.execute(tab);
    expect(errorResult.status).toBe(502);
  });

  it('should intercept Trex demo endpoints automatically and return realistic dinosaur responses', async () => {
    const demoService = new RequestRunnerService();
    const tab: RequestTab = {
      id: 'tab-demo-get',
      name: 'Listar Dinossauros',
      method: 'GET',
      url: 'https://eusouanderson.github.io/Trex-Http-Client/get',
      params: [{ id: 'p1', key: 'limit', value: '3', enabled: true }],
      headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = await demoService.execute(tab);
    expect(result.status).toBe(200);
    expect(result.statusText).toBe('OK');
    const data = result.data as { count: number; total: number; dinosaurs: { name: string }[] };
    expect(data.count).toBe(3);
    expect(data.dinosaurs[0]?.name).toBe('Tyrannosaurus Rex');
  });

  it('should intercept Trex demo POST endpoint and return created status 201', async () => {
    const demoService = new RequestRunnerService();
    const tab: RequestTab = {
      id: 'tab-demo-post',
      name: 'Criar Espécime',
      method: 'POST',
      url: 'https://eusouanderson.github.io/Trex-Http-Client/post',
      params: [],
      headers: [],
      bodyType: 'json',
      body: JSON.stringify({ name: 'Iguanodon', diet: 'Herbívoro' }),
      isDirty: false,
    };

    const result = await demoService.execute(tab);
    expect(result.status).toBe(201);
    const data = result.data as { success: boolean; data: { name: string } };
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Iguanodon');
  });

  it('should fallback to globalThis.fetch when customFetch is not provided and url is not demo', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ external: true }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const defaultService = new RequestRunnerService();
    const tab: RequestTab = {
      id: 'tab-external',
      name: 'External Request',
      method: 'GET',
      url: 'https://api.external.com/data',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = await defaultService.execute(tab);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ external: true });
    expect(fetchSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('should resolve url string from URL instance or Request object in fetchFn', async () => {
    const demoService = new RequestRunnerService();
    const urlObj = new URL('https://eusouanderson.github.io/Trex-Http-Client/get');
    const resUrl = await demoService.fetchFn(urlObj);
    expect(resUrl.status).toBe(200);

    const reqObj = new Request('https://eusouanderson.github.io/Trex-Http-Client/get');
    const resReq = await demoService.fetchFn(reqObj);
    expect(resReq.status).toBe(200);
  });
});
