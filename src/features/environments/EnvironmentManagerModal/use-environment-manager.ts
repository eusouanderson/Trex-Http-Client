import { ref, computed, type ComputedRef } from 'vue';
import { useEnvironments } from '../use-environments';
import { generateId } from '../environment.entity';
import type { Environment } from '../interfaces';

interface UseEnvironmentManagerReturn {
  environments: ComputedRef<Environment[]>;
  activeEnvironment: ComputedRef<Environment | null>;
  selectedEnvironment: ComputedRef<Environment | null>;
  selectEnvironment: (id: string) => void;
  handleCreateEnvironment: () => void;
  handleDeleteEnvironment: (id: string) => void;
  setAsActiveEnvironment: (id: string) => void;
  addVariable: () => void;
  removeVariable: (varId: string) => void;
  updateVariable: (varId: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => void;
  updateEnvironmentName: (name: string) => void;
  isVariableVisible: (varId: string) => boolean;
  toggleVariableVisibility: (varId: string) => void;
  close: () => void;
}

const useEnvironmentManager = (emitClose: () => void): UseEnvironmentManagerReturn => {
  const {
    environments,
    activeEnvironment,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
  } = useEnvironments();

  const resolveCurrentEnvId = (): string | null => {
    if (activeEnvironment.value !== null) {
      return activeEnvironment.value.id;
    }
    const first = environments.value[0];
    if (first !== undefined) {
      return first.id;
    }
    return null;
  };

  const activeEnvId = ref<string | null>(resolveCurrentEnvId());
  const visibleVariableIds = ref<string[]>([]);
  
  const selectedEnvironment = computed((): Environment | null => {
    return environments.value.find((e) => e.id === activeEnvId.value) ?? null;
  });

  const selectEnvironment = (id: string): void => {
    activeEnvId.value = id;
  };

  const setAsActiveEnvironment = (id: string): void => {
    setActiveEnvironment(id);
  };

  const handleCreateEnvironment = (): void => {
    const count = environments.value.length + 1;
    const newEnv = createEnvironment(`Ambiente ${count.toString()}`);
    activeEnvId.value = newEnv.id;
  };

  const handleDeleteEnvironment = (id: string): void => {
    deleteEnvironment(id);
    if (activeEnvId.value === id) {
      activeEnvId.value = resolveCurrentEnvId();
    }
  };

  const addVariable = (): void => {
    const env = selectedEnvironment.value;
    if (env === null) return;
    
    const clone: Environment = { ...env, variables: [...env.variables] };
    clone.variables.push({
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
    });
    updateEnvironment(clone);
  };

  const removeVariable = (varId: string): void => {
    const env = selectedEnvironment.value;
    if (env === null) return;
    
    const clone: Environment = { ...env, variables: env.variables.filter((v) => v.id !== varId) };
    updateEnvironment(clone);
    visibleVariableIds.value = visibleVariableIds.value.filter((id) => id !== varId);
  };

  const updateVariable = (varId: string, field: 'key' | 'value' | 'enabled', val: string | boolean): void => {
    const env = selectedEnvironment.value;
    if (env === null) return;
    
    const clone: Environment = { ...env, variables: [...env.variables] };
    const index = clone.variables.findIndex((v) => v.id === varId);
    if (index >= 0) {
      clone.variables[index] = Object.assign({}, clone.variables[index], { [field]: val });
      updateEnvironment(clone);
    }
  };

  const updateEnvironmentName = (name: string): void => {
    const env = selectedEnvironment.value;
    if (env === null || name.trim().length === 0) return;
    const clone: Environment = { ...env, name: name.trim() };
    updateEnvironment(clone);
  };

  const isVariableVisible = (varId: string): boolean => {
    return visibleVariableIds.value.includes(varId);
  };

  const toggleVariableVisibility = (varId: string): void => {
    if (visibleVariableIds.value.includes(varId)) {
      visibleVariableIds.value = visibleVariableIds.value.filter((id) => id !== varId);
    } else {
      visibleVariableIds.value = [...visibleVariableIds.value, varId];
    }
  };

  return {
    environments,
    activeEnvironment,
    selectedEnvironment,
    selectEnvironment,
    handleCreateEnvironment,
    handleDeleteEnvironment,
    setAsActiveEnvironment,
    addVariable,
    removeVariable,
    updateVariable,
    updateEnvironmentName,
    isVariableVisible,
    toggleVariableVisibility,
    close: emitClose,
  };
};

export { useEnvironmentManager };
