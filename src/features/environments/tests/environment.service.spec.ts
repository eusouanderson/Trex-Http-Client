import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentService } from '../environment.service';
import type { Environment, IEnvironmentRepository } from '../interfaces';

class MockRepository implements IEnvironmentRepository {
  private data: Environment[] = [];

  getAll(): Environment[] {
    return this.data;
  }
  
  getById(id: string): Environment | null {
    return this.data.find(e => e.id === id) ?? null;
  }
  
  save(env: Environment): void {
    const idx = this.data.findIndex(e => e.id === env.id);
    if (idx >= 0) this.data[idx] = env;
    else this.data.push(env);
  }
  
  delete(id: string): void {
    this.data = this.data.filter(e => e.id !== id);
  }
}

describe('EnvironmentService', () => {
  let service: EnvironmentService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = new MockRepository();
    service = new EnvironmentService(repository);
  });

  it('should create and retrieve environments', () => {
    const env = service.createEnvironment('Staging');
    expect(env.name).toBe('Staging');
    expect(env.id).toBeDefined();

    const all = service.getEnvironments();
    expect(all).toHaveLength(1);
    expect(all[0]?.name).toBe('Staging');
  });

  it('should manage active environment', () => {
    const env1 = service.createEnvironment('Env1');
    const env2 = service.createEnvironment('Env2');

    service.setActiveEnvironment(env1.id);
    expect(service.getActiveEnvironment()?.id).toBe(env1.id);

    service.setActiveEnvironment(env2.id);
    expect(service.getActiveEnvironment()?.id).toBe(env2.id);

    service.setActiveEnvironment(null);
    expect(service.getActiveEnvironment()).toBeNull();
  });

  it('should interpolate strings using the active environment', () => {
    const env = service.createEnvironment('TestEnv');
    env.variables.push({
      id: 'v1',
      key: 'url',
      value: 'https://api.com',
      enabled: true,
    });
    env.variables.push({
      id: 'v2',
      key: 'version',
      value: 'v2',
      enabled: true,
    });
    env.variables.push({
      id: 'v3',
      key: 'secret',
      value: '123',
      enabled: false,
    });
    service.updateEnvironment(env);
    service.setActiveEnvironment(env.id);

    const result = service.interpolate('{{url}}/api/{{version}}/users?key={{secret}}&other={{unknown}}');
    expect(result).toBe('https://api.com/api/v2/users?key={{secret}}&other={{unknown}}');
  });

  it('should return original text if no active environment', () => {
    const text = '{{url}}/endpoint';
    expect(service.interpolate(text)).toBe(text);
  });
});
