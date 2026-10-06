import type { HttpMethod, QueryParams, TrexRequestConfig } from './interfaces';

class RequestBuilder {
  public buildUrl(url: string, baseURL?: string, params?: QueryParams): string {
    let resolvedUrl = url;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (baseURL !== undefined && baseURL.length > 0) {
        const normalizedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
        const normalizedPath = url.startsWith('/') ? url : `/${url}`;
        resolvedUrl = `${normalizedBase}${normalizedPath}`;
      }
    }

    if (params === undefined) {
      return resolvedUrl;
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(key, String(item));
        }
      } else {
        searchParams.append(key, String(value));
      }
    }

    const queryString = searchParams.toString();
    if (queryString.length === 0) {
      return resolvedUrl;
    }

    const separator = resolvedUrl.includes('?') ? '&' : '?';
    return `${resolvedUrl}${separator}${queryString}`;
  }

  public buildRequestInit(
    method: HttpMethod,
    url: string,
    config: TrexRequestConfig,
  ): { url: string; init: RequestInit } {
    const resolvedUrl = this.buildUrl(url, config.baseURL, config.params);
    const headers: Record<string, string> = { ...config.headers };

    let body: BodyInit | null | undefined = config.body;

    if (config.data !== undefined) {
      if (
        typeof FormData !== 'undefined' &&
        config.data instanceof FormData
      ) {
        body = config.data;
        delete headers['Content-Type'];
      } else if (
        (typeof Blob !== 'undefined' && config.data instanceof Blob) ||
        config.data instanceof ArrayBuffer ||
        (typeof URLSearchParams !== 'undefined' &&
          config.data instanceof URLSearchParams)
      ) {
        body = config.data as BodyInit;
      } else if (typeof config.data === 'string') {
        body = config.data;
      } else {
        body = JSON.stringify(config.data);
        headers['Content-Type'] ??= 'application/json';
      }
    }

    const init: RequestInit = {
      method,
      headers,
      body: body ?? undefined,
      signal: config.signal,
      credentials: config.credentials,
    };

    return { url: resolvedUrl, init };
  }
}

export { RequestBuilder };
