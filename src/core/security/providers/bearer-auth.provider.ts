import type {
  BearerAuthConfig,
  IAuthProvider,
  ResolvedAuthData,
} from '../interfaces';

class BearerAuthProvider implements IAuthProvider<BearerAuthConfig> {
  public readonly type = 'bearer';

  public apply(context: {
    config: BearerAuthConfig;
    resolveVariable: (val: string) => string;
  }): Promise<ResolvedAuthData> {
    const { config, resolveVariable } = context;

    if (!config.enabled) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const rawToken = resolveVariable(config.token).trim();
    if (rawToken.length === 0) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const prefix = (config.prefix ?? 'Bearer').trim();
    let headerValue = rawToken;

    if (!rawToken.startsWith(`${prefix} `)) {
      headerValue = `${prefix} ${rawToken}`;
    }

    return Promise.resolve({
      headers: {
        Authorization: headerValue,
      },
      params: {},
      secrets: [rawToken.replace(new RegExp(`^${prefix}\\s+`), '')],
    });
  }
}

export { BearerAuthProvider };

