import { describe, expect, it } from 'vitest';
import { NoAuthProvider } from '../providers/no-auth.provider';
import { BearerAuthProvider } from '../providers/bearer-auth.provider';
import { BasicAuthProvider } from '../providers/basic-auth.provider';
import { ApiKeyAuthProvider } from '../providers/api-key-auth.provider';
import { CustomAuthProvider } from '../providers/custom-auth.provider';
import { AuthRegistry } from '../auth-registry';

describe('Auth Providers', () => {
  const resolveVar = (val: string): string => {
    return val.replace('{{token}}', 'trex-super-secret-token').replace('{{key}}', 'apikey-123');
  };

  describe('NoAuthProvider', () => {
    it('should return empty headers and params', async () => {
      const provider = new NoAuthProvider();
      const result = await provider.apply({
        config: { type: 'none' },
        resolveVariable: resolveVar,
      });

      expect(result.headers).toEqual({});
      expect(result.params).toEqual({});
      expect(result.secrets).toEqual([]);
    });
  });

  describe('BearerAuthProvider', () => {
    const provider = new BearerAuthProvider();

    it('should generate Bearer authorization header with resolved token', async () => {
      const result = await provider.apply({
        config: { type: 'bearer', token: '{{token}}', enabled: true },
        resolveVariable: resolveVar,
      });

      expect(result.headers.Authorization).toBe('Bearer trex-super-secret-token');
      expect(result.secrets).toContain('trex-super-secret-token');
    });

    it('should use default Bearer prefix when prefix is undefined', async () => {
      const result = await provider.apply({
        config: { type: 'bearer', token: 'raw-token', enabled: true },
        resolveVariable: resolveVar,
      });

      expect(result.headers.Authorization).toBe('Bearer raw-token');
    });

    it('should handle custom prefix without duplicating', async () => {
      const result = await provider.apply({
        config: { type: 'bearer', token: 'trex-super-secret-token', prefix: 'Token', enabled: true },
        resolveVariable: resolveVar,
      });

      expect(result.headers.Authorization).toBe('Token trex-super-secret-token');
    });

    it('should not add header if already prefixed with Bearer and custom prefix is default', async () => {
      const result = await provider.apply({
        config: { type: 'bearer', token: 'Bearer trex-token', prefix: 'Bearer', enabled: true },
        resolveVariable: resolveVar,
      });

      expect(result.headers.Authorization).toBe('Bearer trex-token');
    });

    it('should return empty headers when disabled or empty token', async () => {
      const result = await provider.apply({
        config: { type: 'bearer', token: 'secret', enabled: false },
        resolveVariable: resolveVar,
      });

      expect(result.headers).toEqual({});

      const emptyRes = await provider.apply({
        config: { type: 'bearer', token: '', enabled: true },
        resolveVariable: resolveVar,
      });
      expect(emptyRes.headers).toEqual({});
    });
  });

  describe('BasicAuthProvider', () => {
    const provider = new BasicAuthProvider();

    it('should encode username and password in Base64 according to UTF-8 specs', async () => {
      const result = await provider.apply({
        config: { type: 'basic', username: 'dino_user', password: 'p@ssw0rd!#🦖', enabled: true },
        resolveVariable: resolveVar,
      });

      const authHeader = result.headers.Authorization;
      expect(authHeader).toBeDefined();
      expect(authHeader?.startsWith('Basic ')).toBe(true);

      const base64Part = (authHeader ?? '').replace('Basic ', '');
      const binaryString = atob(base64Part);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoded = new TextDecoder().decode(bytes);
      expect(decoded).toBe('dino_user:p@ssw0rd!#🦖');
      expect(result.secrets).toContain('p@ssw0rd!#🦖');
    });

    it('should not generate header when disabled', async () => {
      const result = await provider.apply({
        config: { type: 'basic', username: 'u', password: 'p', enabled: false },
        resolveVariable: resolveVar,
      });

      expect(result.headers).toEqual({});

      const emptyRes = await provider.apply({
        config: { type: 'basic', username: '', password: '', enabled: true },
        resolveVariable: resolveVar,
      });
      expect(emptyRes.headers).toEqual({});

      const noPasswordRes = await provider.apply({
        config: { type: 'basic', username: 'useronly', password: '', enabled: true },
        resolveVariable: resolveVar,
      });
      expect(noPasswordRes.headers.Authorization).toBeDefined();
      expect(noPasswordRes.secrets).toEqual([]);
    });
  });

  describe('ApiKeyAuthProvider', () => {
    const provider = new ApiKeyAuthProvider();

    it('should add to header when addTo is header', async () => {
      const result = await provider.apply({
        config: { type: 'apiKey', key: 'X-API-KEY', value: '{{key}}', addTo: 'header', enabled: true },
        resolveVariable: resolveVar,
      });

      expect(result.headers['X-API-KEY']).toBe('apikey-123');
      expect(result.params).toEqual({});
      expect(result.secrets).toContain('apikey-123');
    });

    it('should add to query params when addTo is query', async () => {
      const result = await provider.apply({
        config: { type: 'apiKey', key: 'api_key', value: 'secret-key-1', addTo: 'query', enabled: true },
        resolveVariable: resolveVar,
      });

      expect(result.headers).toEqual({});
      expect(result.params.api_key).toBe('secret-key-1');
      expect(result.secrets).toContain('secret-key-1');
    });

    it('should return empty when disabled', async () => {
      const result = await provider.apply({
        config: { type: 'apiKey', key: 'k', value: 'v', addTo: 'header', enabled: false },
        resolveVariable: resolveVar,
      });

      expect(result.headers).toEqual({});
      expect(result.params).toEqual({});

      const emptyKeyRes = await provider.apply({
        config: { type: 'apiKey', key: '', value: 'val', addTo: 'header', enabled: true },
        resolveVariable: resolveVar,
      });
      expect(emptyKeyRes.headers).toEqual({});

      const emptyValueRes = await provider.apply({
        config: { type: 'apiKey', key: 'X-Key', value: '', addTo: 'header', enabled: true },
        resolveVariable: resolveVar,
      });
      expect(emptyValueRes.headers['X-Key']).toBe('');
      expect(emptyValueRes.secrets).toEqual([]);
    });
  });

  describe('CustomAuthProvider', () => {
    const provider = new CustomAuthProvider();

    it('should return empty when disabled', async () => {
      const result = await provider.apply({
        config: {
          type: 'custom',
          enabled: false,
          headers: [{ id: '1', key: 'X-Key', value: 'val', enabled: true }],
          params: [],
        },
        resolveVariable: resolveVar,
      });
      expect(result.headers).toEqual({});
      expect(result.secrets).toEqual([]);
    });

    it('should populate enabled custom headers and params and capture secret keys', async () => {
      const result = await provider.apply({
        config: {
          type: 'custom',
          enabled: true,
          headers: [
            { id: '1', key: 'X-Tenant', value: 'dino-corp', enabled: true },
            { id: '2', key: 'X-Disabled', value: 'noop', enabled: false },
            { id: '3', key: 'X-Auth-Token', value: 'tok123', enabled: true },
          ],
          params: [
            { id: '4', key: 'auth_sign', value: '{{key}}', enabled: true },
            { id: '5', key: 'api_key_param', value: 'secret_query', enabled: true },
          ],
        },
        resolveVariable: resolveVar,
      });

      expect(result.headers['X-Tenant']).toBe('dino-corp');
      expect(result.headers['X-Disabled']).toBeUndefined();
      expect(result.headers['X-Auth-Token']).toBe('tok123');
      expect(result.params.auth_sign).toBe('apikey-123');
      expect(result.params.api_key_param).toBe('secret_query');
      expect(result.secrets).toContain('tok123');
      expect(result.secrets).toContain('secret_query');
    });
  });

  describe('AuthRegistry', () => {
    it('should correctly register and retrieve providers', () => {
      const registry = new AuthRegistry();
      const bearerProvider = new BearerAuthProvider();
      registry.register(bearerProvider);

      expect(registry.has('bearer')).toBe(true);
      expect(registry.get('bearer')).toBe(bearerProvider);
      expect(registry.has('oauth2')).toBe(false);
      expect(registry.get('oauth2')).toBeNull();
    });
  });
});

