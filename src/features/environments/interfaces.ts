interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  createdAt: number;
  updatedAt: number;
}

interface IEnvironmentRepository {
  getAll(): Environment[];
  getById(id: string): Environment | null;
  save(environment: Environment): void;
  delete(id: string): void;
}

interface IEnvironmentService {
  getEnvironments(): Environment[];
  getEnvironmentById(id: string): Environment | null;
  getActiveEnvironment(): Environment | null;
  setActiveEnvironment(id: string | null): void;
  createEnvironment(name: string): Environment;
  updateEnvironment(environment: Environment): Environment;
  deleteEnvironment(id: string): void;
  interpolate(text: string): string;
}

export type {
  EnvironmentVariable,
  Environment,
  IEnvironmentRepository,
  IEnvironmentService,
};

