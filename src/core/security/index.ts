import { AuthRegistry } from './auth-registry';
import { ApiKeyAuthProvider } from './providers/api-key-auth.provider';
import { BasicAuthProvider } from './providers/basic-auth.provider';
import { BearerAuthProvider } from './providers/bearer-auth.provider';
import { CustomAuthProvider } from './providers/custom-auth.provider';
import { NoAuthProvider } from './providers/no-auth.provider';
import { OAuth2Provider } from './providers/oauth2.provider';
import { SecretsMaskerService } from './secrets-masker.service';

const createDefaultAuthRegistry = (): AuthRegistry => {
  const registry = new AuthRegistry();
  registry.register(new NoAuthProvider());
  registry.register(new BearerAuthProvider());
  registry.register(new BasicAuthProvider());
  registry.register(new ApiKeyAuthProvider());
  registry.register(new CustomAuthProvider());
  registry.register(new OAuth2Provider());
  return registry;
};

export type * from './interfaces';
export {
  AuthRegistry,
  createDefaultAuthRegistry,
  NoAuthProvider,
  BearerAuthProvider,
  BasicAuthProvider,
  ApiKeyAuthProvider,
  CustomAuthProvider,
  OAuth2Provider,
  SecretsMaskerService,
};

