import type { Environment, IEnvironmentRepository, IEnvironmentService } from './interfaces';
import { EnvironmentEntity } from './environment.entity';

class EnvironmentService implements IEnvironmentService {
  private activeEnvironmentId: string | null = null;
  private readonly ACTIVE_ENV_KEY = 'trex_active_environment';

  constructor(private readonly repository: IEnvironmentRepository) {
    this.activeEnvironmentId = localStorage.getItem(this.ACTIVE_ENV_KEY) ?? null;
  }

  public getEnvironments(): Environment[] {
    return this.repository.getAll();
  }

  public getEnvironmentById(id: string): Environment | null {
    return this.repository.getById(id);
  }

  public getActiveEnvironment(): Environment | null {
    if (this.activeEnvironmentId === null) return null;
    return this.getEnvironmentById(this.activeEnvironmentId);
  }

  public setActiveEnvironment(id: string | null): void {
    this.activeEnvironmentId = id;
    if (id !== null) {
      localStorage.setItem(this.ACTIVE_ENV_KEY, id);
    } else {
      localStorage.removeItem(this.ACTIVE_ENV_KEY);
    }
  }

  public createEnvironment(name: string): Environment {
    const newEnv = EnvironmentEntity.create(name);
    this.repository.save(newEnv);
    return newEnv;
  }

  public updateEnvironment(environment: Environment): Environment {
    const env = { ...environment, updatedAt: Date.now() };
    this.repository.save(env);
    return env;
  }

  public deleteEnvironment(id: string): void {
    this.repository.delete(id);
    if (this.activeEnvironmentId === id) {
      this.setActiveEnvironment(null);
    }
  }

  public interpolate(text: string): string {
    if (text.length === 0) return text;
    const activeEnv = this.getActiveEnvironment();
    if (activeEnv === null) return text;

    const entity = new EnvironmentEntity(activeEnv);
    return text.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match: string, key: string) => {
      const resolvedValue = entity.resolveVariable(key);
      return resolvedValue ?? match;
    });
  }
}

export { EnvironmentService };
