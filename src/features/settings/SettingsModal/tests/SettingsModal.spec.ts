import { mount } from '@vue/test-utils';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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
    expect(wrapper.findComponent({ name: 'TrexLogo' }).exists()).toBe(true);

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

  it('should allow triggering file upload and template download in theme tab', async () => {
    const wrapper = mount(SettingsModal);

    const themeTabButton = wrapper
      .findAll('nav button')
      .find((btn) => btn.text().includes('Tema Jurássico'));
    await themeTabButton?.trigger('click');

    const downloadBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Modelo JSON'));
    expect(downloadBtn).toBeDefined();

    const createObjectURL = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      return undefined;
    });
    await downloadBtn?.trigger('click');
    clickSpy.mockRestore();

    const uploadBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Importar Tema'));
    expect(uploadBtn).toBeDefined();

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.exists()).toBe(true);

    const inputClickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click');
    await uploadBtn?.trigger('click');
    expect(inputClickSpy).toHaveBeenCalled();
    inputClickSpy.mockRestore();

    const validJson = JSON.stringify({
      id: 'custom-velociraptor-neon',
      name: 'Velociraptor Neon',
      icon: '🦖',
      description: 'Velociraptor custom',
      colors: {
        surfaceGround: '#0c1a10',
        surfacePanel: '#14291a',
        surfaceCard: '#1d3824',
        surfaceBorder: '#27472f',
        surfaceHover: '#33573c',
        accent: '#22c55e',
        accentLight: '#4ade80',
        accentBorder: '#16a34a',
      },
    });

    const file = new File([validJson], 'theme.json', { type: 'application/json' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: true,
    });
    await fileInput.trigger('change');
    await new Promise((r) => setTimeout(r, 20));

    const { settings } = useSettings();
    expect(settings.value.theme).toBe('custom-velociraptor-neon');
    expect(settings.value.customThemes).toHaveLength(1);

    await wrapper.vm.$nextTick();

    const deleteBtn = wrapper.find('button[title="Excluir tema customizado"]');
    if (deleteBtn.exists()) {
      await deleteBtn.trigger('click');
      expect(settings.value.customThemes).toHaveLength(0);
    }

    Object.defineProperty(fileInput.element, 'files', {
      value: [],
      writable: true,
    });
    await fileInput.trigger('change');

    const invalidFile = new File(['not valid json'], 'bad.json', { type: 'application/json' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [invalidFile],
      writable: true,
    });
    await fileInput.trigger('change');
    await new Promise((r) => setTimeout(r, 20));
    await wrapper.vm.$nextTick();

    const errorBanner = wrapper.find('.bg-magma-500\\/10');
    expect(errorBanner.exists()).toBe(true);

    const nonStringFile = new File([''], 'empty.json', { type: 'application/json' });
    const originalFileReader = window.FileReader;
    class MockFileReader {
      public onload: ((e: { target: { result: ArrayBuffer } }) => void) | null = null;
      public readAsText(): void {
        if (this.onload) {
          this.onload({ target: { result: new ArrayBuffer(0) } });
        }
      }
    }
    // @ts-expect-error mock FileReader
    window.FileReader = MockFileReader;
    Object.defineProperty(fileInput.element, 'files', {
      value: [nonStringFile],
      writable: true,
    });
    await fileInput.trigger('change');
    window.FileReader = originalFileReader;
  });
});

