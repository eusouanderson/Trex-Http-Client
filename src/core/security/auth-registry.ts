import type {
  AuthType,
  IAuthProvider,
  IAuthRegistry,
} from './interfaces';

class AuthRegistry implements IAuthRegistry {
  private readonly providers = new Map<AuthType, IAuthProvider>();

  public register(provider: IAuthProvider): void {
    this.providers.set(provider.type, provider);
  }

  public get(type: AuthType): IAuthProvider | null {
    return this.providers.get(type) ?? null;
  }

  public has(type: AuthType): boolean {
    return this.providers.has(type);
  }
}

export { AuthRegistry };

