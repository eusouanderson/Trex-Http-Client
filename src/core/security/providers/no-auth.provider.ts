import type {
  AuthConfig,
  IAuthProvider,
  ResolvedAuthData,
} from '../interfaces';

class NoAuthProvider implements IAuthProvider {
  public readonly type = 'none';

  public apply(_context?: {
    config: AuthConfig;
    resolveVariable: (val: string) => string;
  }): Promise<ResolvedAuthData> {
    return Promise.resolve({
      headers: {},
      params: {},
      secrets: [],
    });
  }
}

export { NoAuthProvider };

