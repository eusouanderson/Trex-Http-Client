import { ref, computed, type ComputedRef } from 'vue';
import type { Environment } from './interfaces';
import { EnvironmentService } from './environment.service';
import { EnvironmentRepository } from './environment.repository';

const repository = new EnvironmentRepository();
const environmentService = new EnvironmentService(repository);
void repository.load().then(() => {
  environmentsState.value = environmentService.getEnvironments();
  activeEnvironmentState.value = environmentService.getActiveEnvironment();
});

const environmentsState = ref<Environment[]>(environmentService.getEnvironments());
const activeEnvironmentState = ref<Environment | null>(environmentService.getActiveEnvironment());

interface UseEnvironmentsReturn {
  environments: ComputedRef<Environment[]>;
  activeEnvironment: ComputedRef<Environment | null>;
  setActiveEnvironment: (id: string | null) => void;
  createEnvironment: (name: string) => Environment;
  updateEnvironment: (environment: Environment) => void;
  deleteEnvironment: (id: string) => void;
  interpolate: (text: string) => string;
  environmentService: EnvironmentService;
}

const useEnvironments = (): UseEnvironmentsReturn => {
  const refreshState = (): void => {
    environmentsState.value = environmentService.getEnvironments();
    activeEnvironmentState.value = environmentService.getActiveEnvironment();
  };

  const getEnvironments = computed((): Environment[] => environmentsState.value);
  const getActiveEnvironment = computed((): Environment | null => activeEnvironmentState.value);

  const setActiveEnvironment = (id: string | null): void => {
    environmentService.setActiveEnvironment(id);
    refreshState();
  };

  const createEnvironment = (name: string): Environment => {
    const created = environmentService.createEnvironment(name);
    refreshState();
    return created;
  };

  const updateEnvironment = (environment: Environment): void => {
    environmentService.updateEnvironment(environment);
    refreshState();
  };

  const deleteEnvironment = (id: string): void => {
    environmentService.deleteEnvironment(id);
    refreshState();
  };
  
  const interpolate = (text: string): string => {
    return environmentService.interpolate(text);
  };

  return {
    environments: getEnvironments,
    activeEnvironment: getActiveEnvironment,
    setActiveEnvironment,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    interpolate,
    environmentService,
  };
};

export { useEnvironments, environmentService };
