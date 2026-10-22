import type {
  IPwaUpdateService,
  PwaUpdateState,
  RegisterSwOptions,
  SwRegisterFn,
  SwUpdateFn,
} from './interfaces';

class PwaUpdateService implements IPwaUpdateService {
  private state: PwaUpdateState = {
    updateAvailable: false,
    isUpdating: false,
    isDismissed: false,
    offlineReady: false,
  };

  private updateFn?: SwUpdateFn;
  private listeners = new Set<(state: PwaUpdateState) => void>();

  constructor(registerFn?: SwRegisterFn) {
    if (registerFn) {
      this.initRegistration(registerFn);
    }
  }

  private initRegistration = (registerFn: SwRegisterFn): void => {
    const options: RegisterSwOptions = {
      immediate: true,
      onNeedRefresh: () => {
        this.state = {
          ...this.state,
          updateAvailable: true,
          isDismissed: false,
        };
        this.notifyListeners();
      },
      onOfflineReady: () => {
        this.state = {
          ...this.state,
          offlineReady: true,
        };
        this.notifyListeners();
      },
    };

    this.updateFn = registerFn(options);
  };

  private notifyListeners = (): void => {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      listener(currentState);
    });
  };

  getState = (): PwaUpdateState => {
    return { ...this.state };
  };

  isUpdateAvailable = (): boolean => {
    return this.state.updateAvailable;
  };

  isUpdating = (): boolean => {
    return this.state.isUpdating;
  };

  isDismissed = (): boolean => {
    return this.state.isDismissed;
  };

  dismissUpdate = (): void => {
    this.state = {
      ...this.state,
      isDismissed: true,
    };
    this.notifyListeners();
  };

  applyUpdate = async (): Promise<void> => {
    if (this.state.isUpdating) {
      return;
    }

    if (!this.updateFn) {
      return;
    }

    this.state = {
      ...this.state,
      isUpdating: true,
    };
    this.notifyListeners();

    await this.updateFn(true);
  };

  onStateChange = (listener: (state: PwaUpdateState) => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}

export { PwaUpdateService };
