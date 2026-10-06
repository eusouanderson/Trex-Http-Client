import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEnvironments } from '../../use-environments';
import { useEnvironmentSelector } from '../use-environment-selector';

describe('useEnvironmentSelector', () => {
  beforeEach(() => {
    localStorage.clear();
    const { environments, deleteEnvironment, setActiveEnvironment } = useEnvironments();
    environments.value.forEach((env) => {
      deleteEnvironment(env.id);
    });
    setActiveEnvironment(null);
  });

  it('should select environment and clear active environment when none selected', () => {
    const { createEnvironment } = useEnvironments();
    const env = createEnvironment('Dev');

    const mockOpen = vi.fn();
    const selector = useEnvironmentSelector(mockOpen);

    selector.handleSelectEnvironment(env.id);
    expect(selector.activeEnvironment.value?.id).toBe(env.id);

    selector.handleSelectEnvironment('none');
    expect(selector.activeEnvironment.value).toBeNull();
  });

  it('should trigger open manager when selecting manage option or calling openManager', () => {
    const mockOpen = vi.fn();
    const selector = useEnvironmentSelector(mockOpen);

    selector.handleSelectEnvironment('manage');
    expect(mockOpen).toHaveBeenCalledTimes(1);

    selector.openManager();
    expect(mockOpen).toHaveBeenCalledTimes(2);
  });
});

