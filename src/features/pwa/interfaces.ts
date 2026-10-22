interface PwaUpdateState {
  updateAvailable: boolean;
  isUpdating: boolean;
  isDismissed: boolean;
  offlineReady: boolean;
}

type SwUpdateFn = (reloadPage?: boolean) => Promise<void>;

interface RegisterSwOptions {
  immediate?: boolean;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegistered?: (registration: unknown) => void;
  onRegisterError?: (error: unknown) => void;
}

type SwRegisterFn = (options?: RegisterSwOptions) => SwUpdateFn;

interface IPwaUpdateService {
  getState(): PwaUpdateState;
  isUpdateAvailable(): boolean;
  isUpdating(): boolean;
  isDismissed(): boolean;
  dismissUpdate(): void;
  applyUpdate(): Promise<void>;
  onStateChange(listener: (state: PwaUpdateState) => void): () => void;
}

export type {
  PwaUpdateState,
  SwUpdateFn,
  RegisterSwOptions,
  SwRegisterFn,
  IPwaUpdateService,
};
