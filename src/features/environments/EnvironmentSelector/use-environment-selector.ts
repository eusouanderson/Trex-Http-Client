import { type ComputedRef } from 'vue';
import { useEnvironments } from '../use-environments';
import type { Environment } from '../interfaces';

interface UseEnvironmentSelectorReturn {
  environments: ComputedRef<Environment[]>;
  activeEnvironment: ComputedRef<Environment | null>;
  handleSelectEnvironment: (id: string) => void;
  openManager: () => void;
}

const useEnvironmentSelector = (emitOpenManager: () => void): UseEnvironmentSelectorReturn => {
  const { environments, activeEnvironment, setActiveEnvironment } = useEnvironments();

  const handleSelectEnvironment = (id: string): void => {
    if (id === 'manage') {
      emitOpenManager();
      return;
    }
    setActiveEnvironment(id === 'none' ? null : id);
  };

  const openManager = (): void => {
    emitOpenManager();
  };

  return {
    environments,
    activeEnvironment,
    handleSelectEnvironment,
    openManager,
  };
};

export { useEnvironmentSelector };
