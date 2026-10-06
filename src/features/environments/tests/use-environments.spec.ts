import { describe, it, expect, beforeEach } from 'vitest';
import { useEnvironments } from '../use-environments';

describe('useEnvironments', () => {
  beforeEach(() => {
    localStorage.clear();
    const { environments, deleteEnvironment } = useEnvironments();
    environments.value.forEach(env => { deleteEnvironment(env.id); });
  });

  it('should create and retrieve environments in reactive state', () => {
    const { createEnvironment, environments } = useEnvironments();
    createEnvironment('Dev');
    
    expect(environments.value.length).toBe(1);
    expect(environments.value[0]?.name).toBe('Dev');
  });

  it('should change active environment and interpolate values', () => {
    const { createEnvironment, environments, updateEnvironment, setActiveEnvironment, interpolate } = useEnvironments();
    createEnvironment('Test');
    
    const env = environments.value[0];
    env?.variables.push({
      id: 'var1',
      key: 'host',
      value: 'localhost:8080',
      enabled: true
    });
    if (env) updateEnvironment(env);
    
    if (env) setActiveEnvironment(env.id);
    
    const result = interpolate('http://{{host}}/api');
    expect(result).toBe('http://localhost:8080/api');
  });
});
