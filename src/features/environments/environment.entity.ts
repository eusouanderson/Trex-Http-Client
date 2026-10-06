import type { Environment, EnvironmentVariable } from './interfaces';

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString()}-${Math.random().toString(36).slice(2, 9)}`;
};

class EnvironmentEntity implements Environment {
  public id: string;
  public name: string;
  public variables: EnvironmentVariable[];
  public createdAt: number;
  public updatedAt: number;

  constructor(data: Environment) {
    this.id = data.id;
    this.name = data.name;
    this.variables = [...data.variables];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static create(name: string): Environment {
    return {
      id: generateId(),
      name,
      variables: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  public resolveVariable(key: string): string | undefined {
    const trimmedKey = key.trim();
    const variable = this.variables.find((v) => v.key.trim() === trimmedKey && v.enabled);
    return variable?.value;
  }
}

export { EnvironmentEntity, generateId };
