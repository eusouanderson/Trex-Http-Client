import type {
  ApiKeyAuthConfig,
  IAuthProvider,
  ResolvedAuthData,
} from '../interfaces';

class ApiKeyAuthProvider implements IAuthProvider<ApiKeyAuthConfig> {
  public readonly type = 'apiKey';

  public apply(context: {
    config: ApiKeyAuthConfig;
    resolveVariable: (val: string) => string;
  }): Promise<ResolvedAuthData> {
    const { config, resolveVariable } = context;

    if (!config.enabled) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const key = resolveVariable(config.key).trim();
    const value = resolveVariable(config.value);

    if (key.length === 0) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const headers: Record<string, string> = {};
    const params: Record<string, string> = {};

    if (config.addTo === 'header') {
      headers[key] = value;
    } else {
      params[key] = value;
    }

    return Promise.resolve({
      headers,
      params,
      secrets: value.length > 0 ? [value] : [],
    });
  }
}

export { ApiKeyAuthProvider };

