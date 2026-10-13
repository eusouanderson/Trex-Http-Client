import type {
  CustomAuthConfig,
  IAuthProvider,
  ResolvedAuthData,
} from '../interfaces';

class CustomAuthProvider implements IAuthProvider<CustomAuthConfig> {
  public readonly type = 'custom';

  public apply(context: {
    config: CustomAuthConfig;
    resolveVariable: (val: string) => string;
  }): Promise<ResolvedAuthData> {
    const { config, resolveVariable } = context;

    if (!config.enabled) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const headers: Record<string, string> = {};
    const params: Record<string, string> = {};
    const secrets: string[] = [];

    for (const h of config.headers) {
      if (h.enabled && h.key.trim().length > 0) {
        const resolvedKey = resolveVariable(h.key).trim();
        const resolvedValue = resolveVariable(h.value);
        headers[resolvedKey] = resolvedValue;
        if (
          resolvedKey.toLowerCase().includes('token') ||
          resolvedKey.toLowerCase().includes('key') ||
          resolvedKey.toLowerCase().includes('secret')
        ) {
          secrets.push(resolvedValue);
        }
      }
    }

    for (const p of config.params) {
      if (p.enabled && p.key.trim().length > 0) {
        const resolvedKey = resolveVariable(p.key).trim();
        const resolvedValue = resolveVariable(p.value);
        params[resolvedKey] = resolvedValue;
        if (
          resolvedKey.toLowerCase().includes('token') ||
          resolvedKey.toLowerCase().includes('key') ||
          resolvedKey.toLowerCase().includes('secret')
        ) {
          secrets.push(resolvedValue);
        }
      }
    }

    return Promise.resolve({
      headers,
      params,
      secrets,
    });
  }
}

export { CustomAuthProvider };

