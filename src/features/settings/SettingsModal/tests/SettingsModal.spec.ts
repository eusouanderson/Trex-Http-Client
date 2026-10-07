import { mount } from '@vue/test-utils';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useSettings } from '../../use-settings';
import SettingsModal from '../index.vue';

describe('SettingsModal Component', () => {
  beforeAll(() => {
    if (typeof Range.prototype.getClientRects === 'undefined') {
      Range.prototype.getClientRects = (): DOMRectList => [] as unknown as DOMRectList;
      Range.prototype.getBoundingClientRect = (): DOMRect => ({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: (): Record<string, number> => ({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        }),
      });
    }
  });

  beforeEach(() => {
    const { resetSettings, openSettings } = useSettings();
    resetSettings();
    openSettings();
  });

  it('should render modal and allow navigating to json tab', async () => {
    const wrapper = mount(SettingsModal);

    expect(wrapper.find('h2').text()).toContain('Configurações do T-Rex');
  expect(wrapper.find('header img[alt="T-Rex"]').attributes('src')).toContain('/logos/Trex.png');

    const jsonTabButton = wrapper
      .findAll('nav button')
      .find((btn) => btn.text().includes('Editor JSON'));

    expect(jsonTabButton).toBeDefined();
    await jsonTabButton?.trigger('click');

    expect(wrapper.text()).toContain('Personalizar Cores de Sintaxe');
    expect(wrapper.text()).toContain('Pré-visualização do Editor');
  });

  it('should allow modifying a json theme color', async () => {
    const wrapper = mount(SettingsModal);

    const jsonTabButton = wrapper
      .findAll('nav button')
      .find((btn) => btn.text().includes('Editor JSON'));
    await jsonTabButton?.trigger('click');

    const colorInput = wrapper.find('input[type="color"]');
    expect(colorInput.exists()).toBe(true);

    await colorInput.setValue('#112233');

    const { settings } = useSettings();
    expect(settings.value.jsonTheme.preset).toBe('custom');
  });

  it('should allow selecting a jurassic theme that modifies global theme and json theme', async () => {
    const wrapper = mount(SettingsModal);

    const themeTabButton = wrapper
      .findAll('nav button')
      .find((btn) => btn.text().includes('Tema Jurássico'));
    expect(themeTabButton).toBeDefined();
    await themeTabButton?.trigger('click');

    const draculaButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Raptor Dracula'));
    expect(draculaButton).toBeDefined();
    await draculaButton?.trigger('click');

    const { settings } = useSettings();
    expect(settings.value.theme).toBe('raptor-dracula');
    expect(settings.value.jsonTheme.preset).toBe('raptor-dracula');
    expect(settings.value.jsonTheme.backgroundColor).toBe('#1e1d27');
  });

  it('should navigate to general tab and toggle orientation, density, and reset defaults', async () => {
    const wrapper = mount(SettingsModal);

    const generalTabButton = wrapper
      .findAll('nav button')
      .find((btn) => btn.text().includes('Geral'));
    await generalTabButton?.trigger('click');

    const verticalBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Vertical'));
    await verticalBtn?.trigger('click');

    const horizontalBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Horizontal'));
    await horizontalBtn?.trigger('click');

    const compactBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Compacto'));
    await compactBtn?.trigger('click');

    const comfortableBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Confortável'));
    await comfortableBtn?.trigger('click');

    const { settings } = useSettings();
    expect(settings.value.orientation).toBe('horizontal');
    expect(settings.value.density).toBe('comfortable');

    const resetBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Restaurar'));
    await resetBtn?.trigger('click');
    expect(settings.value.orientation).toBe('horizontal');
  });

  it('should navigate to network tab and configure network settings', async () => {
    const wrapper = mount(SettingsModal);

    const networkTabButton = wrapper
      .findAll('nav button')
      .find((btn) => btn.text().includes('Rede & HTTP'));
    await networkTabButton?.trigger('click');

    const numberInputs = wrapper.findAll('input[type="number"]');
    expect(numberInputs.length).toBeGreaterThanOrEqual(2);
    const timeoutInput = numberInputs[0];
    const retryInput = numberInputs[1];

    if (timeoutInput && retryInput) {
      await timeoutInput.setValue(12000);
      await retryInput.setValue(4);
    }

    const { settings } = useSettings();
    expect(settings.value.defaultTimeout).toBe(12000);
    expect(settings.value.defaultRetryAttempts).toBe(4);

    const toggleBtn = wrapper.find('button.w-10.h-5');
    if (toggleBtn.exists()) {
      await toggleBtn.trigger('click');
    }
  });

  it('should close modal when clicking header close or done buttons', async () => {
    const wrapper = mount(SettingsModal);
    const doneBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Concluído'));
    await doneBtn?.trigger('click');

    const { isOpen, openSettings } = useSettings();
    expect(isOpen.value).toBe(false);

    openSettings();
    const reopenedWrapper = mount(SettingsModal);
    const backdrop = reopenedWrapper.find('div.fixed');
    await backdrop.trigger('click');
    expect(isOpen.value).toBe(false);

    openSettings();
    const finalWrapper = mount(SettingsModal);
    const closeXBtn = finalWrapper.find('header button');
    await closeXBtn.trigger('click');
    expect(isOpen.value).toBe(false);
  });
});
