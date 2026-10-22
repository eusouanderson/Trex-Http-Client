import { describe, expect, it, vi } from 'vitest';
import type { IPwaUpdateService, PwaUpdateState } from '../../interfaces';
import { usePwaUpdateNotification } from '../use-pwa-update-notification';

describe('usePwaUpdateNotification composable', () => {
  const createMockService = (initialState?: Partial<PwaUpdateState>): {
    service: IPwaUpdateService;
    applyUpdateSpy: ReturnType<typeof vi.fn>;
    dismissUpdateSpy: ReturnType<typeof vi.fn>;
  } => {
    let currentState: PwaUpdateState = {
      updateAvailable: true,
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

    return { service, applyUpdateSpy, dismissUpdateSpy };
  };

  it('should reflect update notification state and trigger actions', async () => {
    const { service, applyUpdateSpy, dismissUpdateSpy } = createMockService();
    const { shouldShow, isUpdating, applyUpdate, dismissUpdate } =
      usePwaUpdateNotification(service);

    expect(shouldShow.value).toBe(true);
    expect(isUpdating.value).toBe(false);

    await applyUpdate();
    expect(applyUpdateSpy).toHaveBeenCalled();

    dismissUpdate();
    expect(dismissUpdateSpy).toHaveBeenCalled();
  });
});
