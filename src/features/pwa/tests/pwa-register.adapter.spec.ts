import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegisterSwOptions } from '../interfaces';
import { createDefaultSwRegister } from '../pwa-register.adapter';

describe('createDefaultSwRegister adapter', () => {
  const originalLocation = window.location;
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        reload: reloadMock,
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it('should return noop update function when serviceWorker is not supported in navigator', async () => {
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {},
    });

    const registerFn = createDefaultSwRegister();
    const updateFn = registerFn();
    await expect(updateFn()).resolves.toBeUndefined();

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('should register service worker when document is already complete', async () => {
    type ListenerFn = () => void;
    let installingStateChange: ListenerFn | undefined;
    let updateFoundListener: ListenerFn | undefined;

    const mockInstalling = {
      state: 'installing',
      addEventListener: vi.fn((event: string, cb: ListenerFn) => {
        if (event === 'statechange') {
          installingStateChange = cb;
        }
      }),
    };

    const mockRegistration = {
      waiting: undefined as unknown,
      installing: mockInstalling,
      addEventListener: vi.fn((event: string, cb: ListenerFn) => {
        if (event === 'updatefound') {
          updateFoundListener = cb;
        }
      }),
    };

    const mockRegister = vi.fn().mockResolvedValue(mockRegistration);
    const mockControllerListeners: Record<string, ListenerFn> = {};

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: null,
        register: mockRegister,
        addEventListener: vi.fn((event: string, cb: ListenerFn) => {
          mockControllerListeners[event] = cb;
        }),
      },
    });

    const onRegistered = vi.fn();
    const onOfflineReady = vi.fn();
    const onNeedRefresh = vi.fn();

    const options: RegisterSwOptions = {
      onRegistered,
      onOfflineReady,
      onNeedRefresh,
    };

    const registerFn = createDefaultSwRegister();
    const updateFn = registerFn(options);

    await Promise.resolve();
    await Promise.resolve();

    expect(mockRegister).toHaveBeenCalled();
    expect(onRegistered).toHaveBeenCalledWith(mockRegistration);

    mockRegistration.installing = null as unknown as typeof mockInstalling;
    updateFoundListener?.();

    mockRegistration.installing = mockInstalling;
    updateFoundListener?.();
    mockInstalling.state = 'installed';
    installingStateChange?.();
    expect(onOfflineReady).toHaveBeenCalled();

    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      value: {},
    });

    installingStateChange?.();
    expect(onNeedRefresh).toHaveBeenCalled();

    await updateFn(false);
    expect(reloadMock).not.toHaveBeenCalled();

    await updateFn(true);
    expect(reloadMock).toHaveBeenCalled();
  });

  it('should trigger onNeedRefresh immediately if waiting worker already exists', async () => {
    const mockWaiting = {
      postMessage: vi.fn(),
    };

    const mockRegistration = {
      waiting: mockWaiting,
      installing: null,
      addEventListener: vi.fn(),
    };

    const mockControllerListeners: Record<string, () => void> = {};

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: {},
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn((event: string, cb: () => void) => {
          mockControllerListeners[event] = cb;
        }),
      },
    });

    const onNeedRefresh = vi.fn();
    const registerFn = createDefaultSwRegister();
    const updateFn = registerFn({ onNeedRefresh });

    await Promise.resolve();
    await Promise.resolve();

    expect(onNeedRefresh).toHaveBeenCalled();

    await updateFn(false);
    mockControllerListeners.controllerchange?.();
    expect(reloadMock).not.toHaveBeenCalled();

    await updateFn(true);
    expect(mockWaiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

    mockControllerListeners.controllerchange?.();
    expect(reloadMock).toHaveBeenCalledTimes(1);

    mockControllerListeners.controllerchange?.();
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('should handle registration errors gracefully via onRegisterError', async () => {
    const registerError = new Error('registration failed');
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: null,
        register: vi.fn().mockRejectedValue(registerError),
        addEventListener: vi.fn(),
      },
    });

    const onRegisterError = vi.fn();
    const registerFn = createDefaultSwRegister();
    registerFn({ onRegisterError });

    await Promise.resolve();
    await Promise.resolve();

    expect(onRegisterError).toHaveBeenCalledWith(registerError);
  });

  it('should attach to window load event when readyState is loading', async () => {
    const originalReadyState = document.readyState;
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'loading',
    });

    let loadHandler: (() => void) | undefined;
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(
      (event: string, handler: unknown) => {
        if (event === 'load') {
          loadHandler = handler as () => void;
        }
      },
    );

    const mockRegistration = {
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: null,
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
      },
    });

    const registerFn = createDefaultSwRegister();
    registerFn();

    expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
    loadHandler?.();

    await Promise.resolve();
    await Promise.resolve();

    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: originalReadyState,
    });
  });
});
