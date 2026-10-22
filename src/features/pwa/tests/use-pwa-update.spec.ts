import { describe, expect, it, vi } from 'vitest';
import type { IPwaUpdateService, PwaUpdateState } from '../interfaces';
import { usePwaUpdate } from '../use-pwa-update';

describe('usePwaUpdate composable', () => {
  const createMockService = (initialState?: Partial<PwaUpdateState>): {
    service: IPwaUpdateService;
    triggerStateChange: (state: Partial<PwaUpdateState>) => void;
    dismissUpdateSpy: ReturnType<typeof vi.fn>;
    applyUpdateSpy: ReturnType<typeof vi.fn>;
  } => {
    let currentState: PwaUpdateState = {
      updateAvailable: false,
      isUpdating: false,
      isDismissed: false,
      offlineReady: false,
      ...initialState,
    };

    const listeners = new Set<(s: PwaUpdateState) => void>();
    const dismissUpdateSpy = vi.fn(() => {
      currentState = { ...currentState, isDismissed: true };
      listeners.forEach((l) => {
        l({ ...currentState });
      });
    });

    const applyUpdateSpy = vi.fn().mockImplementation(async () => {
      currentState = { ...currentState, isUpdating: true };
      listeners.forEach((l) => {
        l({ ...currentState });
      });
      await Promise.resolve();
    });

    const service: IPwaUpdateService = {
      getState: () => ({ ...currentState }),
      isUpdateAvailable: () => currentState.updateAvailable,
      isUpdating: () => currentState.isUpdating,
      isDismissed: () => currentState.isDismissed,
      dismissUpdate: () => {
        dismissUpdateSpy();
      },
      applyUpdate: async () => {
        await applyUpdateSpy();
      },
      onStateChange: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    };

    const triggerStateChange = (patch: Partial<PwaUpdateState>): void => {
      currentState = { ...currentState, ...patch };
      listeners.forEach((l) => {
        l({ ...currentState });
      });
    };

    return { service, triggerStateChange, dismissUpdateSpy, applyUpdateSpy };
  };

  it('should initialize with service state and compute shouldShowNotification correctly', () => {
    const { service, triggerStateChange } = createMockService();
    const { isUpdateAvailable, isUpdating, isDismissed, shouldShowNotification } =
      usePwaUpdate(service);

    expect(isUpdateAvailable.value).toBe(false);
    expect(isUpdating.value).toBe(false);
    expect(isDismissed.value).toBe(false);
    expect(shouldShowNotification.value).toBe(false);

    triggerStateChange({ updateAvailable: true });
    expect(isUpdateAvailable.value).toBe(true);
    expect(shouldShowNotification.value).toBe(true);
  });

  it('should dismiss update and hide notification', () => {
    const { service, triggerStateChange, dismissUpdateSpy } = createMockService({ updateAvailable: true });
    const { shouldShowNotification, dismissUpdate, isDismissed } = usePwaUpdate(service);

    expect(shouldShowNotification.value).toBe(true);
    dismissUpdate();
    expect(dismissUpdateSpy).toHaveBeenCalled();
    expect(isDismissed.value).toBe(true);
    expect(shouldShowNotification.value).toBe(false);

    triggerStateChange({ updateAvailable: true, isDismissed: false });
    expect(shouldShowNotification.value).toBe(true);
  });

  it('should apply update through service', async () => {
    const { service, applyUpdateSpy } = createMockService({ updateAvailable: true });
    const { applyUpdate, isUpdating, shouldShowNotification } = usePwaUpdate(service);

    await applyUpdate();
    expect(applyUpdateSpy).toHaveBeenCalled();
    expect(isUpdating.value).toBe(true);
    expect(shouldShowNotification.value).toBe(false);
  });
});
