import { describe, expect, it } from 'vitest';
import { DemoEndpointEntity } from '../demo-endpoint.entity';
import { DemoEndpointService } from '../demo-endpoint.service';
import { createDemoEndpointService } from '../index';

describe('DemoEndpointService', () => {
  const createService = (): DemoEndpointService => {
    const entity = new DemoEndpointEntity();
    return new DemoEndpointService(entity);
  };

  it('should instantiate via factory createDemoEndpointService', () => {
    const service = createDemoEndpointService();
    expect(service).toBeInstanceOf(DemoEndpointService);
    expect(service.matches('/get')).toBe(true);
  });

  describe('matches', () => {
    it('should match Trex GitHub Pages demo URLs', () => {
      const service = createService();

      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/get')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/post')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/put')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/delete')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/auth/bearer')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/auth/basic')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/auth/api-key')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/status/404')).toBe(true);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/delay/50')).toBe(true);
    });

    it('should match relative demo endpoint URLs with and without trailing slash', () => {
      const service = createService();

      expect(service.matches('/get')).toBe(true);
      expect(service.matches('/get/')).toBe(true);
      expect(service.matches('/post')).toBe(true);
      expect(service.matches('/put')).toBe(true);
      expect(service.matches('/delete')).toBe(true);
      expect(service.matches('/auth/bearer')).toBe(true);
      expect(service.matches('/status/200')).toBe(true);
      expect(service.matches('/dinosaurs')).toBe(true);
      expect(service.matches('/api/dinosaurs')).toBe(true);
    });

    it('should not match external non-demo URLs or invalid routes', () => {
      const service = createService();

      expect(service.matches('https://api.github.com/users')).toBe(false);
      expect(service.matches('https://jsonplaceholder.typicode.com/posts')).toBe(false);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client/outro-caminho')).toBe(false);
      expect(service.matches('https://eusouanderson.github.io/Trex-Http-Client')).toBe(false);
      expect(service.matches('')).toBe(false);
      expect(service.matches('http://[invalid-host')).toBe(false);
    });
  });

  describe('dispatch - GET /get', () => {
    it('should return 200 with dinosaur list and echoed request info', async () => {
      const service = createService();
      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/get?diet=Carnívoro&limit=2', {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-Custom-Client': 'Trex-App' },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(response.headers.get('x-powered-by')).toBe('Trex HTTP Client Engine');

      const body = (await response.json()) as {
        dinosaurs: { name: string; diet: string }[];
        count: number;
        echo: { params: Record<string, string>; headers: Record<string, string> };
      };

      expect(body.count).toBe(2);
      expect(body.dinosaurs.every((d) => d.diet === 'Carnívoro')).toBe(true);
      expect(body.echo.params.diet).toBe('Carnívoro');
      expect(body.echo.headers['x-custom-client']).toBe('Trex-App');
    });

    it('should accept headers as Headers instance and array entries', async () => {
      const service = createService();
      const headersInstance = new Headers({ 'x-custom': 'val' });
      const res = await service.dispatch('/get', { headers: headersInstance });
      expect(res.status).toBe(200);

      const arrayHeaders = [['x-array-header', 'array-val']] as [string, string][];
      const res2 = await service.dispatch('/get', { headers: arrayHeaders });
      expect(res2.status).toBe(200);
    });
  });

  describe('dispatch - POST /post', () => {
    it('should return 201 with created specimen and echoed body', async () => {
      const service = createService();
      const payload = {
        name: 'Parasaurolophus',
        period: 'Cretáceo Superior',
        diet: 'Herbívoro',
      };

      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(201);
      const json = (await response.json()) as {
        success: boolean;
        message: string;
        data: { id: string; name: string };
      };

      expect(json.success).toBe(true);
      expect(json.message).toContain('registrado com sucesso');
      expect(json.data.id).toContain('dino-');
      expect(json.data.name).toBe('Parasaurolophus');
    });

    it('should handle raw non-json text body gracefully', async () => {
      const service = createService();
      const response = await service.dispatch('/post', {
        method: 'POST',
        body: 'raw-non-json-content',
      });
      expect(response.status).toBe(201);
    });
  });

  describe('dispatch - PUT /put', () => {
    it('should return 200 with updated specimen', async () => {
      const service = createService();
      const payload = {
        id: 'dino-1',
        weightKg: 9500,
        fossilLocation: 'Museu Paleontológico',
      };

      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/put', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(200);
      const json = (await response.json()) as {
        success: boolean;
        data: { id: string; weightKg: number };
      };

      expect(json.success).toBe(true);
      expect(json.data.id).toBe('dino-1');
      expect(json.data.weightKg).toBe(9500);
    });

    it('should update specimen using query param id or fallback to dino-1', async () => {
      const service = createService();
      const resQuery = await service.dispatch('/put?id=dino-2', {
        method: 'PUT',
        body: JSON.stringify({ weightKg: 8500 }),
      });
      expect(resQuery.status).toBe(200);

      const resFallback = await service.dispatch('/put', {
        method: 'PUT',
        body: 'non-object-string',
      });
      expect(resFallback.status).toBe(200);
    });
  });

  describe('dispatch - DELETE /delete', () => {
    it('should return 200 with deletion confirmation', async () => {
      const service = createService();
      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/delete?id=dino-2', {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      const json = (await response.json()) as {
        success: boolean;
        message: string;
      };

      expect(json.success).toBe(true);
      expect(json.message).toContain('removido');
    });
  });

  describe('dispatch - Auth scenarios', () => {
    it('should authenticate bearer token successfully', async () => {
      const service = createService();
      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/auth/bearer', {
        method: 'GET',
        headers: { Authorization: 'Bearer trex_super_token_999' },
      });

      expect(response.status).toBe(200);
      const json = (await response.json()) as { authenticated: boolean; authType: string; tokenMasked: string };
      expect(json.authenticated).toBe(true);
      expect(json.authType).toBe('bearer');
      expect(json.tokenMasked).toContain('***');
    });

    it('should authenticate short bearer token with fallback masking', async () => {
      const service = createService();
      const response = await service.dispatch('/auth/bearer', {
        headers: { Authorization: 'Bearer short' },
      });
      expect(response.status).toBe(200);
      const json = (await response.json()) as { tokenMasked: string };
      expect(json.tokenMasked).toBe('***');
    });

    it('should reject missing or invalid bearer token with 401', async () => {
      const service = createService();
      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/auth/bearer', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
      const json = (await response.json()) as { authenticated: boolean; error: string };
      expect(json.authenticated).toBe(false);
      expect(json.error).toContain('Token Bearer');
    });

    it('should authenticate basic auth credentials successfully', async () => {
      const service = createService();
      const creds = btoa('paleo_user:fossil_pass');
      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/auth/basic', {
        method: 'GET',
        headers: { Authorization: `Basic ${creds}` },
      });

      expect(response.status).toBe(200);
      const json = (await response.json()) as { authenticated: boolean; user: string };
      expect(json.authenticated).toBe(true);
      expect(json.user).toBe('paleo_user');
    });

    it('should fallback username when basic auth cannot be decoded', async () => {
      const service = createService();
      const response = await service.dispatch('/auth/basic', {
        headers: { Authorization: 'Basic %%%invalid-base64%%%' },
      });
      expect(response.status).toBe(200);
      const json = (await response.json()) as { user: string };
      expect(json.user).toBe('usuario');
    });

    it('should reject missing basic auth with 401', async () => {
      const service = createService();
      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/auth/basic', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
      const json = (await response.json()) as { authenticated: boolean };
      expect(json.authenticated).toBe(false);
    });

    it('should authenticate api key via header or query param', async () => {
      const service = createService();
      const headerResponse = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/auth/api-key', {
        method: 'GET',
        headers: { 'X-API-Key': 'trex-key-secret-123' },
      });
      expect(headerResponse.status).toBe(200);

      const queryResponse = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/auth/api-key?api_key=trex-query-key', {
        method: 'GET',
      });
      expect(queryResponse.status).toBe(200);
    });

    it('should authenticate short api key with fallback masking', async () => {
      const service = createService();
      const response = await service.dispatch('/auth/api-key', {
        headers: { 'X-API-Key': 'abc' },
      });
      expect(response.status).toBe(200);
      const json = (await response.json()) as { apiKeyMasked: string };
      expect(json.apiKeyMasked).toBe('***');
    });

    it('should reject missing api key with 403', async () => {
      const service = createService();
      const response = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/auth/api-key', {
        method: 'GET',
      });

      expect(response.status).toBe(403);
      const json = (await response.json()) as { authenticated: boolean; error: string };
      expect(json.authenticated).toBe(false);
      expect(json.error).toContain('Chave de API');
    });
  });

  describe('dispatch - Status and delay simulation', () => {
    it('should return simulated status code with custom or default statusText', async () => {
      const service = createService();
      const res404 = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/status/404');
      expect(res404.status).toBe(404);

      const res500 = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/status/500');
      expect(res500.status).toBe(500);

      const res418 = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/status/418');
      expect(res418.status).toBe(418);

      const res599 = await service.dispatch('/status/599');
      expect(res599.status).toBe(599);
      expect(res599.statusText).toBe('Unknown Status');

      const resInvalid = await service.dispatch('/status/invalido');
      expect(resInvalid.status).toBe(200);

      const resTooHigh = await service.dispatch('/status/999');
      expect(resTooHigh.status).toBe(200);

      const resTooLow = await service.dispatch('/status/50');
      expect(resTooLow.status).toBe(200);
    });

    it('should simulate delay response with fallback value', async () => {
      const service = createService();
      const res = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/delay/10');
      expect(res.status).toBe(200);
      const json = (await res.json()) as { message: string; delayedMs: number };
      expect(json.delayedMs).toBe(10);

      const fallbackRes = await service.dispatch('/delay/invalido');
      expect(fallbackRes.status).toBe(200);
    });

    it('should return 404 for unknown endpoint path or invalid URL', async () => {
      const service = createService();
      const res = await service.dispatch('https://eusouanderson.github.io/Trex-Http-Client/desconhecido');
      expect(res.status).toBe(404);

      const invalidUrlRes = await service.dispatch('http://[invalid-host');
      expect(invalidUrlRes.status).toBe(404);
    });
  });
});
