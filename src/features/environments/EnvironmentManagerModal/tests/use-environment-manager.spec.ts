import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEnvironments } from '../../use-environments';
import { useEnvironmentManager } from '../use-environment-manager';

describe('useEnvironmentManager', () => {
  beforeEach(() => {
    localStorage.clear();
    const { environments, deleteEnvironment, setActiveEnvironment } = useEnvironments();
    environments.value.forEach((env) => {
      deleteEnvironment(env.id);
    });
    setActiveEnvironment(null);
  });

  it('should create environment with default name and select it without prompt', () => {
    let closed = false;
    const manager = useEnvironmentManager(() => {
      closed = true;
    });

    manager.handleCreateEnvironment();

    expect(manager.environments.value.length).toBe(1);
    expect(manager.selectedEnvironment.value).not.toBeNull();
    expect(manager.selectedEnvironment.value?.name).toBe('Ambiente 1');
    expect(closed).toBe(false);
  });

  it('should add, update and remove variables from selected environment', () => {
    const manager = useEnvironmentManager(vi.fn());
    manager.handleCreateEnvironment();

    manager.addVariable();
    expect(manager.selectedEnvironment.value?.variables.length).toBe(1);

    const varId = manager.selectedEnvironment.value?.variables[0]?.id ?? '';
    expect(varId.length).toBeGreaterThan(0);

    manager.updateVariable(varId, 'key', 'baseUrl');
    manager.updateVariable(varId, 'value', 'https://api.dinossauro.dev');

    const updatedVar = manager.selectedEnvironment.value?.variables[0];
    expect(updatedVar?.key).toBe('baseUrl');
    expect(updatedVar?.value).toBe('https://api.dinossauro.dev');

    manager.removeVariable(varId);
    expect(manager.selectedEnvironment.value?.variables.length).toBe(0);
  });

  it('should allow setting the selected environment as active', () => {
    const manager = useEnvironmentManager(vi.fn());
    manager.handleCreateEnvironment();

    const envId = manager.selectedEnvironment.value?.id ?? '';
    manager.setAsActiveEnvironment(envId);

    expect(manager.activeEnvironment.value?.id).toBe(envId);
  });

  it('should toggle variable visibility for masked values', () => {
    const manager = useEnvironmentManager(vi.fn());
    manager.handleCreateEnvironment();
    manager.addVariable();

    const varId = manager.selectedEnvironment.value?.variables[0]?.id ?? '';

    expect(manager.isVariableVisible(varId)).toBe(false);

    manager.toggleVariableVisibility(varId);
    expect(manager.isVariableVisible(varId)).toBe(true);

    manager.toggleVariableVisibility(varId);
    expect(manager.isVariableVisible(varId)).toBe(false);
  });

  it('should select environment and update environment name', () => {
    const manager = useEnvironmentManager(vi.fn());
    manager.handleCreateEnvironment();
    const envId = manager.selectedEnvironment.value?.id ?? '';

    manager.selectEnvironment(envId);
    expect(manager.selectedEnvironment.value?.id).toBe(envId);

    manager.updateEnvironmentName('Ambiente Produção');
    expect(manager.selectedEnvironment.value?.name).toBe('Ambiente Produção');

    manager.updateEnvironmentName('   ');
    expect(manager.selectedEnvironment.value?.name).toBe('Ambiente Produção');
  });

  it('should handle deletion of active environment and empty fallback', () => {
    const manager = useEnvironmentManager(vi.fn());
    manager.handleCreateEnvironment();
    manager.handleCreateEnvironment();

    expect(manager.environments.value.length).toBe(2);
    const firstId = manager.environments.value[0]?.id ?? '';
    const secondId = manager.environments.value[1]?.id ?? '';

    manager.selectEnvironment(secondId);
    manager.handleDeleteEnvironment(secondId);
    expect(manager.selectedEnvironment.value?.id).toBe(firstId);

    manager.handleDeleteEnvironment(firstId);
    expect(manager.selectedEnvironment.value).toBeNull();
  });

  it('should handle variable operations gracefully when no environment is selected or variable not found', () => {
    let closed = false;
    const manager = useEnvironmentManager(() => {
      closed = true;
    });

    manager.addVariable();
    manager.removeVariable('non-existent');
    manager.updateVariable('non-existent', 'key', 'test');
    manager.updateEnvironmentName('Test');

    manager.handleCreateEnvironment();
    manager.addVariable();
    manager.updateVariable('var-invalido', 'key', 'val');

    manager.close();
    expect(closed).toBe(true);
  });

  it('should fallback to first environment if active environment is null', () => {
    const { createEnvironment, setActiveEnvironment } = useEnvironments();
    const created = createEnvironment('Ambiente Standalone');
    setActiveEnvironment(null);

    const manager = useEnvironmentManager(vi.fn());
    expect(manager.selectedEnvironment.value?.id).toBe(created.id);
  });

  it('should initialize selectedEnvironment with activeEnvironment id when present', () => {
    const { createEnvironment, setActiveEnvironment } = useEnvironments();
    const env = createEnvironment('Ambiente Ativo Inicial');
    setActiveEnvironment(env.id);

    const manager = useEnvironmentManager(vi.fn());
    expect(manager.selectedEnvironment.value?.id).toBe(env.id);
  });
});
