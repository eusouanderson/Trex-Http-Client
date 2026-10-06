import { describe, it, expect, vi } from 'vitest';
import { EnvironmentEntity } from '../environment.entity';

describe('EnvironmentEntity', () => {
  it('should create an empty environment correctly', () => {
    const env = EnvironmentEntity.create('Development');
    expect(env.id).toBeDefined();
    expect(env.name).toBe('Development');
    expect(env.variables).toEqual([]);
    expect(env.createdAt).toBeDefined();
    expect(env.updatedAt).toBeDefined();
  });

  it('should resolve a variable value by key', () => {
    const rawEnv = {
      id: '1',
      name: 'Prod',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      variables: [
        { id: 'v1', key: 'base_url', value: 'https://api.prod.com', enabled: true },
        { id: 'v2', key: 'token', value: 'secret', enabled: false },
      ],
    };

    const entity = new EnvironmentEntity(rawEnv);
    expect(entity.resolveVariable('base_url')).toBe('https://api.prod.com');
    expect(entity.resolveVariable('token')).toBeUndefined();
    expect(entity.resolveVariable('not_found')).toBeUndefined();
    expect(entity.resolveVariable('  base_url  ')).toBe('https://api.prod.com');
  });

  it('should use fallback id generation when crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    const env = EnvironmentEntity.create('FallbackEnv');
    expect(env.id).toMatch(/^id-/);
    vi.unstubAllGlobals();
  });
});

