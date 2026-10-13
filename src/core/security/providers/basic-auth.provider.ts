import type {
  BasicAuthConfig,
  IAuthProvider,
  ResolvedAuthData,
} from '../interfaces';

class BasicAuthProvider implements IAuthProvider<BasicAuthConfig> {
  public readonly type = 'basic';

  public apply(context: {
    config: BasicAuthConfig;
    resolveVariable: (val: string) => string;
  }): Promise<ResolvedAuthData> {
    const { config, resolveVariable } = context;

    if (!config.enabled) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const username = resolveVariable(config.username);
    const password = resolveVariable(config.password);

    if (username.length === 0 && password.length === 0) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const utf8Bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = '';
    for (const byte of utf8Bytes) {
      binary += String.fromCharCode(byte);
    }
    const base64Credentials = btoa(binary);

    return Promise.resolve({
      headers: {
        Authorization: `Basic ${base64Credentials}`,
      },
      params: {},
      secrets: password.length > 0 ? [password] : [],
    });
  }
}

export { BasicAuthProvider };

