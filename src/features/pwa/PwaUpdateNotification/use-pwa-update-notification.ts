import type { IPwaUpdateService } from '../interfaces';
import { usePwaUpdate } from '../use-pwa-update';
import type { UsePwaUpdateNotificationReturn } from './interfaces';

const usePwaUpdateNotification = (
  customService?: IPwaUpdateService,
): UsePwaUpdateNotificationReturn => {
  const { shouldShowNotification, isUpdating, applyUpdate, dismissUpdate } =
    usePwaUpdate(customService);

  return {
    shouldShow: shouldShowNotification,
    isUpdating,
    applyUpdate,
    dismissUpdate,
  };
};

export { usePwaUpdateNotification };
