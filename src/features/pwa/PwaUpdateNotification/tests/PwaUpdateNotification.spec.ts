import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import PwaUpdateNotification from '../index.vue';
import * as notificationComposable from '../use-pwa-update-notification';

describe('PwaUpdateNotification Component', () => {
  it('should not render anything when shouldShow is false', () => {
    vi.spyOn(notificationComposable, 'usePwaUpdateNotification').mockReturnValue({
      shouldShow: ref(false),
      isUpdating: ref(false),
      applyUpdate: vi.fn(),
      dismissUpdate: vi.fn(),
    });

    const wrapper = mount(PwaUpdateNotification);
    expect(wrapper.find('[data-testid="pwa-update-notification"]').exists()).toBe(false);
  });

  it('should render toast notification and trigger applyUpdate on button click', async () => {
    const applyUpdateMock = vi.fn();
    const dismissUpdateMock = vi.fn();

    vi.spyOn(notificationComposable, 'usePwaUpdateNotification').mockReturnValue({
      shouldShow: ref(true),
      isUpdating: ref(false),
      applyUpdate: applyUpdateMock,
      dismissUpdate: dismissUpdateMock,
    });

    const wrapper = mount(PwaUpdateNotification);
    expect(wrapper.find('[data-testid="pwa-update-notification"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Nova versão disponível');
    expect(wrapper.text()).toContain('Uma atualização do Trex está pronta para ser instalada.');

    const updateButton = wrapper.find('[data-testid="pwa-update-now-btn"]');
    expect(updateButton.exists()).toBe(true);
    await updateButton.trigger('click');
    expect(applyUpdateMock).toHaveBeenCalled();
  });

  it('should trigger dismissUpdate when Depois button is clicked', async () => {
    const dismissUpdateMock = vi.fn();

    vi.spyOn(notificationComposable, 'usePwaUpdateNotification').mockReturnValue({
      shouldShow: ref(true),
      isUpdating: ref(false),
      applyUpdate: vi.fn(),
      dismissUpdate: dismissUpdateMock,
    });

    const wrapper = mount(PwaUpdateNotification);
    const dismissButton = wrapper.find('[data-testid="pwa-update-dismiss-btn"]');
    expect(dismissButton.exists()).toBe(true);
    await dismissButton.trigger('click');
    expect(dismissUpdateMock).toHaveBeenCalled();
  });

  it('should show updating state and disable button when isUpdating is true', () => {
    vi.spyOn(notificationComposable, 'usePwaUpdateNotification').mockReturnValue({
      shouldShow: ref(true),
      isUpdating: ref(true),
      applyUpdate: vi.fn(),
      dismissUpdate: vi.fn(),
    });

    const wrapper = mount(PwaUpdateNotification);
    const updateButton = wrapper.find('[data-testid="pwa-update-now-btn"]');
    expect(updateButton.attributes('disabled')).toBeDefined();
    expect(updateButton.text()).toContain('Atualizando...');
  });
});
