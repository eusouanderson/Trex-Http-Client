import { createTrexClient, TrexHttpError } from '../../core/http';
import type { QueryParams, TrexRequestConfig } from '../../core/http/interfaces';
import type {
  ExecutionResult,
  IRequestRunnerService,
  RequestTab,
} from './interfaces';

class RequestRunnerService implements IRequestRunnerService {
  private readonly fetchFn?: typeof fetch;

  constructor(customFetch?: typeof fetch) {
    this.fetchFn = customFetch;
  }

  public async execute(
    tab: RequestTab,
    timeoutMs?: number,
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const client = createTrexClient({
      fetch: this.fetchFn,
      timeout: timeoutMs,
    });

    let responseStatus = 200;
    let responseStatusText = 'OK';
    const responseHeaders: Record<string, string> = {};

    client.interceptors.response.use((res) => {
      responseStatus = res.status;
      responseStatusText = res.statusText;
      res.headers.forEach((val, key) => {
        responseHeaders[key.toLowerCase()] = val;
      });
      return res;
    });

    const params: QueryParams = {};
    for (const p of tab.params) {
      if (p.enabled && p.key.trim().length > 0) {
        params[p.key] = p.value;
      }
    }

    const headers: Record<string, string> = {};
    for (const h of tab.headers) {
      if (h.enabled && h.key.trim().length > 0) {
        headers[h.key] = h.value;
      }
    }

    let requestData: unknown;
    if (tab.bodyType === 'json' && tab.body.trim().length > 0) {
      try {
        requestData = JSON.parse(tab.body);
      } catch {
        requestData = tab.body;
      }
      headers['Content-Type'] ??= 'application/json';
    } else if (tab.bodyType === 'text' && tab.body.trim().length > 0) {
      requestData = tab.body;
      headers['Content-Type'] ??= 'text/plain';
    }

    const config: TrexRequestConfig = {
      headers,
      params,
      data: requestData,
    };

    try {
      const response = await client.request(tab.method, tab.url, config);
      const durationMs = Math.round(performance.now() - startTime);

      const responseString =
        typeof response === 'string'
          ? response
          : JSON.stringify(response ?? '');
      const sizeBytes = new TextEncoder().encode(responseString).length;

      return {
        status: responseStatus,
        statusText: responseStatusText,
        durationMs,
        sizeBytes,
        headers: responseHeaders,
        data: response,
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);

      if (err instanceof TrexHttpError) {
        const errorHeaders: Record<string, string> = {};
        err.headers.forEach((val, key) => {
          errorHeaders[key.toLowerCase()] = val;
        });

        const errorString =
          typeof err.data === 'string'
            ? err.data
            : JSON.stringify(err.data ?? '');
        const sizeBytes = new TextEncoder().encode(errorString).length;

        return {
          status: err.status,
          statusText: err.statusText,
          durationMs,
          sizeBytes,
          headers: errorHeaders,
          data: err.data,
        };
      }

      const errorMessage = (err as Error).message;

      return {
        status: 0,
        statusText: 'Error',
        durationMs,
        sizeBytes: 0,
        headers: {},
        data: null,
        error: errorMessage,
      };
    }
  }
}

export { RequestRunnerService };
