import type {
  DemoAuthResponse,
  DemoGetDinosaursResponse,
  DemoMutationResponse,
  DemoRequestEcho,
  DemoStatusResponse,
  IDemoEndpointEntity,
  IDemoEndpointService,
} from './interfaces';

class DemoEndpointService implements IDemoEndpointService {
  private readonly entity: IDemoEndpointEntity;

  constructor(entity: IDemoEndpointEntity) {
    this.entity = entity;
  }

  public matches = (rawUrl: string): boolean => {
    const route = this.extractRoute(rawUrl);
    if (route === null) {
      return false;
    }

    if (
      route === 'get' ||
      route === 'post' ||
      route === 'put' ||
      route === 'delete' ||
      route === 'dinosaurs' ||
      route === 'api/dinosaurs'
    ) {
      return true;
    }

    if (
      route === 'auth/bearer' ||
      route === 'auth/basic' ||
      route === 'auth/api-key'
    ) {
      return true;
    }

    if (route.startsWith('status/') || route.startsWith('delay/')) {
      return true;
    }

    return false;
  };

  public dispatch = async (rawUrl: string, init?: RequestInit): Promise<Response> => {
    const route = this.extractRoute(rawUrl);
    if (route === null) {
      return this.createJsonResponse(404, 'Not Found', {
        error: 'Endpoint de demonstração não encontrado',
        route: null,
        timestamp: new Date().toISOString(),
      });
    }

    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = this.normalizeHeaders(init?.headers);
    const params = this.extractParams(rawUrl);
    const body = this.parseBody(init?.body);

    const echo: DemoRequestEcho = {
      url: rawUrl,
      method,
      headers,
      params,
      body,
    };

    if (route === 'get' || route === 'dinosaurs' || route === 'api/dinosaurs') {
      const dinosaurs = this.entity.filterDinosaurs(params);
      const total = this.entity.getAllDinosaurs().length;
      const responseData: DemoGetDinosaursResponse = {
        message: '🦖 Acervo Paleontológico Trex HTTP Client',
        total,
        count: dinosaurs.length,
        dinosaurs,
        echo,
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(200, 'OK', responseData);
    }

    if (route === 'post') {
      const created = this.entity.createSpecimen(
        typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : undefined,
      );
      const responseData: DemoMutationResponse = {
        success: true,
        message: 'Espécime fóssil registrado com sucesso no acervo do Trex',
        data: created,
        echo,
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(201, 'Created', responseData);
    }

    if (route === 'put') {
      const bodyObj = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : undefined;
      const targetId = typeof bodyObj?.id === 'string' ? bodyObj.id : (params.id ?? 'dino-1');
      const updated = this.entity.updateSpecimen(targetId, bodyObj);

      const responseData: DemoMutationResponse = {
        success: true,
        message: 'Espécime fóssil atualizado com sucesso no acervo do Trex',
        data: updated,
        echo,
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(200, 'OK', responseData);
    }

    if (route === 'delete') {
      const responseData: DemoMutationResponse = {
        success: true,
        message: 'Registro de espécime fóssil removido do acervo com sucesso',
        echo,
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(200, 'OK', responseData);
    }

    if (route === 'auth/bearer') {
      const authHeader = headers.authorization ?? '';
      const match = /^bearer\s+(\S+)$/i.exec(authHeader);

      if (match !== null && typeof match[1] === 'string' && match[1].length > 0) {
        const token = match[1];
        const masked = token.length > 6 ? `${token.substring(0, 4)}***${token.substring(token.length - 2)}` : '***';
        const responseData: DemoAuthResponse = {
          authenticated: true,
          authType: 'bearer',
          user: 'Paleontologista Chefe',
          tokenMasked: masked,
          timestamp: new Date().toISOString(),
        };
        return this.createJsonResponse(200, 'OK', responseData);
      }

      const errorData: DemoAuthResponse = {
        authenticated: false,
        authType: 'bearer',
        error: 'Não autorizado: Token Bearer ausente ou inválido',
        requiredHeader: 'Authorization: Bearer <seu_token>',
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(401, 'Unauthorized', errorData);
    }

    if (route === 'auth/basic') {
      const authHeader = headers.authorization ?? '';
      const match = /^basic\s+(\S+)$/i.exec(authHeader);

      if (match !== null && typeof match[1] === 'string' && match[1].length > 0) {
        let username = 'usuario';
        try {
          const decoded = atob(match[1]);
          const parts = decoded.split(':');
          const [firstPart = 'usuario'] = parts;
          username = firstPart;
        } catch {
          username = 'usuario';
        }

        const responseData: DemoAuthResponse = {
          authenticated: true,
          authType: 'basic',
          user: username,
          timestamp: new Date().toISOString(),
        };
        return this.createJsonResponse(200, 'OK', responseData);
      }

      const errorData: DemoAuthResponse = {
        authenticated: false,
        authType: 'basic',
        error: 'Não autorizado: Credenciais Basic Auth ausentes ou inválidas',
        requiredHeader: 'Authorization: Basic <base64>',
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(401, 'Unauthorized', errorData);
    }

    if (route === 'auth/api-key') {
      const apiKeyHeader = headers['x-api-key'];
      const apiKeyParam = params.api_key;
      const key = apiKeyHeader ?? apiKeyParam;

      if (typeof key === 'string' && key.trim().length > 0) {
        const masked = key.length > 4 ? `${key.substring(0, 2)}***${key.substring(key.length - 2)}` : '***';
        const responseData: DemoAuthResponse = {
          authenticated: true,
          authType: 'api-key',
          user: 'Acesso Autorizado via Chave',
          apiKeyMasked: masked,
          timestamp: new Date().toISOString(),
        };
        return this.createJsonResponse(200, 'OK', responseData);
      }

      const errorData: DemoAuthResponse = {
        authenticated: false,
        authType: 'api-key',
        error: 'Acesso Proibido: Chave de API ausente ou inválida',
        requiredHeader: 'X-API-Key',
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(403, 'Forbidden', errorData);
    }

    if (route.startsWith('status/')) {
      const codeStr = route.replace('status/', '');
      const code = parseInt(codeStr, 10);
      const validCode = !isNaN(code) && code >= 100 && code <= 599 ? code : 200;
      const statusText = this.resolveStatusText(validCode);

      const responseData: DemoStatusResponse = {
        status: validCode,
        statusText,
        message: `Simulação de status HTTP ${String(validCode)} (${statusText})`,
        timestamp: new Date().toISOString(),
      };
      return this.createJsonResponse(validCode, statusText, responseData);
    }

    if (route.startsWith('delay/')) {
      const msStr = route.replace('delay/', '');
      const parsedMs = parseInt(msStr, 10);
      const ms = !isNaN(parsedMs) && parsedMs >= 0 ? Math.min(parsedMs, 5000) : 100;

      await new Promise((resolve) => setTimeout(resolve, ms));

      return this.createJsonResponse(200, 'OK', {
        message: `Resposta atrasada propositalmente em ${String(ms)}ms`,
        delayedMs: ms,
        timestamp: new Date().toISOString(),
      });
    }

    return this.createJsonResponse(404, 'Not Found', {
      error: 'Endpoint de demonstração não encontrado',
      route,
      timestamp: new Date().toISOString(),
    });
  };

  private extractRoute = (rawUrl: string): string | null => {
    let pathname = '';
    try {
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        const parsed = new URL(rawUrl);
        const host = parsed.hostname.toLowerCase();
        const isTrexHost =
          host === 'eusouanderson.github.io' ||
          host === 'localhost' ||
          host === '127.0.0.1';

        if (!isTrexHost) {
          return null;
        }

        pathname = parsed.pathname;
      } else {
        const parsed = new URL(rawUrl, 'https://eusouanderson.github.io');
        pathname = parsed.pathname;
      }
    } catch {
      return null;
    }

    if (pathname.startsWith('/Trex-Http-Client/')) {
      pathname = pathname.replace('/Trex-Http-Client/', '');
    } else if (pathname.startsWith('/Trex-Http-Client')) {
      pathname = pathname.replace('/Trex-Http-Client', '');
    }

    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }

    if (pathname.endsWith('/')) {
      pathname = pathname.substring(0, pathname.length - 1);
    }

    return pathname.length > 0 ? pathname : null;
  };

  private extractParams = (rawUrl: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const urlObj = new URL(rawUrl, 'https://eusouanderson.github.io');
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };

  private normalizeHeaders = (headers?: HeadersInit): Record<string, string> => {
    const normalized: Record<string, string> = {};
    if (!headers) {
      return normalized;
    }

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        normalized[key.toLowerCase()] = value;
      });
      return normalized;
    }

    if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        normalized[key.toLowerCase()] = value;
      }
      return normalized;
    }

    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        normalized[key.toLowerCase()] = value;
      }
    }
    return normalized;
  };

  private parseBody = (body?: BodyInit | null): unknown => {
    if (body === undefined || body === null || typeof body !== 'string') {
      return undefined;
    }
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  };

  private resolveStatusText = (status: number): string => {
    const map: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      418: "I'm a teapot",
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return map[status] ?? 'Unknown Status';
  };

  private createJsonResponse = (status: number, statusText: string, data: unknown): Response => {
    const bodyString = JSON.stringify(data, null, 2);
    const headers = new Headers({
      'content-type': 'application/json; charset=utf-8',
      'x-powered-by': 'Trex HTTP Client Engine',
      'access-control-allow-origin': '*',
    });

    return new Response(bodyString, {
      status,
      statusText,
      headers,
    });
  };
}

export { DemoEndpointService };
