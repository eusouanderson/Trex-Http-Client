import type { ErrorInterceptor, IInterceptorManager } from './interfaces';

interface RegisteredInterceptor<T> {
  id: number;
  fulfilled: T;
  rejected?: ErrorInterceptor;
}

class InterceptorManager<T> implements IInterceptorManager<T> {
  private interceptors: Map<number, RegisteredInterceptor<T>>;
  private nextId: number;

  constructor() {
    this.interceptors = new Map<number, RegisteredInterceptor<T>>();
    this.nextId = 1;
  }

  public use(fulfilled: T, rejected?: ErrorInterceptor): number {
    const id = this.nextId++;
    this.interceptors.set(id, { id, fulfilled, rejected });
    return id;
  }

  public eject(id: number): void {
    this.interceptors.delete(id);
  }

  public clear(): void {
    this.interceptors.clear();
  }

  public forEach(
    fn: (interceptor: { fulfilled: T; rejected?: ErrorInterceptor }) => void,
  ): void {
    for (const item of this.interceptors.values()) {
      fn(item);
    }
  }

  public getItems(): RegisteredInterceptor<T>[] {
    return Array.from(this.interceptors.values());
  }
}

export { InterceptorManager };
