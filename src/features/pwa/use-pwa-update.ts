import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { IPwaUpdateService, PwaUpdateState } from './interfaces';
import { createDefaultSwRegister } from './pwa-register.adapter';
import { PwaUpdateService } from './pwa-update.service';

interface UsePwaUpdateReturn {
  isUpdateAvailable: Ref<boolean>;
  isUpdating: Ref<boolean>;
  isDismissed: Ref<boolean>;
  shouldShowNotification: ComputedRef<boolean>;
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

const defaultPwaService: IPwaUpdateService = new PwaUpdateService(createDefaultSwRegister());

const usePwaUpdate = (customService?: IPwaUpdateService): UsePwaUpdateReturn => {
  const service = customService ?? defaultPwaService;
  const state = ref<PwaUpdateState>(service.getState());

  service.onStateChange((newState: PwaUpdateState) => {
    state.value = newState;
  });

  const isUpdateAvailable = computed<boolean>(() => state.value.updateAvailable);
  const isUpdating = computed<boolean>(() => state.value.isUpdating);
  const isDismissed = computed<boolean>(() => state.value.isDismissed);

  const shouldShowNotification = computed<boolean>(() => {
    return isUpdateAvailable.value && !isDismissed.value && !isUpdating.value;
  });

  const applyUpdate = async (): Promise<void> => {
    await service.applyUpdate();
  };

  const dismissUpdate = (): void => {
    service.dismissUpdate();
  };

  return {
    isUpdateAvailable,
    isUpdating,
    isDismissed,
    shouldShowNotification,
    applyUpdate,
    dismissUpdate,
  };
};

export type { UsePwaUpdateReturn };
export { usePwaUpdate };
