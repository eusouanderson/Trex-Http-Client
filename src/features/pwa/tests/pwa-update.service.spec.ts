import { describe, expect, it, vi } from 'vitest';
import type { RegisterSwOptions, SwRegisterFn, SwUpdateFn } from '../interfaces';
import { PwaUpdateService } from '../pwa-update.service';

describe('PwaUpdateService', () => {
  it('should initialize with default state and not show update available', () => {
    const service = new PwaUpdateService();
    const state = service.getState();

    expect(state.updateAvailable).toBe(false);
    expect(state.isUpdating).toBe(false);
    expect(state.isDismissed).toBe(false);
    expect(state.offlineReady).toBe(false);
    expect(service.isUpdateAvailable()).toBe(false);
    expect(service.isUpdating()).toBe(false);
    expect(service.isDismissed()).toBe(false);
  });

  it('should register service worker when registerFn is supplied', () => {
    let capturedOptions: RegisterSwOptions | undefined;
    const mockUpdateFn = vi.fn<SwUpdateFn>().mockResolvedValue();
    const mockRegister: SwRegisterFn = (options) => {
      capturedOptions = options;
      return mockUpdateFn;
    };

    const service = new PwaUpdateService(mockRegister);
    expect(capturedOptions).toBeDefined();

    capturedOptions?.onRegistered?.({});
    capturedOptions?.onRegisterError?.(new Error('fail'));

    expect(service.getState().updateAvailable).toBe(false);

    capturedOptions?.onOfflineReady?.();
    expect(service.getState().offlineReady).toBe(true);
  });

  it('should transition to updateAvailable when onNeedRefresh is triggered', () => {
    let capturedOptions: RegisterSwOptions | undefined;
    const mockUpdateFn = vi.fn<SwUpdateFn>().mockResolvedValue();
    const mockRegister: SwRegisterFn = (options) => {
      capturedOptions = options;
      return mockUpdateFn;
    };

    const service = new PwaUpdateService(mockRegister);
    const stateChanges: boolean[] = [];
    const unsubscribe = service.onStateChange((state) => {
      stateChanges.push(state.updateAvailable);
    });

    capturedOptions?.onNeedRefresh?.();

    expect(service.isUpdateAvailable()).toBe(true);
    expect(service.isDismissed()).toBe(false);
    expect(stateChanges).toContain(true);

    unsubscribe();
    capturedOptions?.onNeedRefresh?.();
    expect(stateChanges.length).toBe(1);
  });

  it('should dismiss update when dismissUpdate is called and re-show on subsequent update detection', () => {
    let capturedOptions: RegisterSwOptions | undefined;
    const mockUpdateFn = vi.fn<SwUpdateFn>().mockResolvedValue();
    const mockRegister: SwRegisterFn = (options) => {
      capturedOptions = options;
      return mockUpdateFn;
    };

    const service = new PwaUpdateService(mockRegister);
    capturedOptions?.onNeedRefresh?.();
    expect(service.isUpdateAvailable()).toBe(true);
    expect(service.isDismissed()).toBe(false);

    service.dismissUpdate();
    expect(service.isDismissed()).toBe(true);

    capturedOptions?.onNeedRefresh?.();
    expect(service.isDismissed()).toBe(false);
  });

  it('should execute updateFn and set isUpdating when applyUpdate is called', async () => {
    let capturedOptions: RegisterSwOptions | undefined;
    const mockUpdateFn = vi.fn<SwUpdateFn>().mockResolvedValue();
    const mockRegister: SwRegisterFn = (options) => {
      capturedOptions = options;
      return mockUpdateFn;
    };

    const service = new PwaUpdateService(mockRegister);
    capturedOptions?.onNeedRefresh?.();

    await service.applyUpdate();
    expect(mockUpdateFn).toHaveBeenCalledWith(true);
    expect(service.isUpdating()).toBe(true);

    await service.applyUpdate();
    expect(mockUpdateFn).toHaveBeenCalledTimes(1);
  });

  it('should handle applyUpdate safely when no registerFn was supplied', async () => {
    const service = new PwaUpdateService(undefined);
    await service.applyUpdate();
    expect(service.isUpdating()).toBe(false);
  });
});
