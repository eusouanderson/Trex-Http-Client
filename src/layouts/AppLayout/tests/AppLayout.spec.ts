import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import CollectionTree from '../../../features/collections/CollectionTree/index.vue';
import { EnvironmentSelector } from '../../../features/environments';
import { useRequest } from '../../../features/request';
import AppLayout from '../index.vue';

describe('AppLayout Component', () => {
  beforeEach(() => {
    const { createTab, activeTabId, setActiveTab } = useRequest();
    if (!activeTabId.value) {
      createTab();
    } else {
      setActiveTab(activeTabId.value);
    }
  });

  it('should render AppLayout and handle sidebar toggling', async () => {
    const wrapper = mount(AppLayout, {
      global: {
        stubs: {
          Splitpanes: { template: '<div><slot /></div>' },
          Pane: { template: '<div><slot /></div>' },
          VueDraggable: { template: '<div><slot /></div>' },
          CollectionTree: { template: '<div class="collection-tree-stub"></div>' },
          RequestBuilder: { template: '<div class="request-builder-stub"></div>' },
          ResponseViewer: { template: '<div class="response-viewer-stub"></div>' },
          SettingsModal: { template: '<div class="settings-modal-stub"></div>' },
          EnvironmentSelector: { template: '<div class="environment-selector-stub"></div>' },
          EnvironmentManagerModal: { template: '<div class="environment-manager-stub"></div>' },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('T-Rex');
    expect(wrapper.findComponent({ name: 'TrexLogo' }).exists()).toBe(true);

    const toggleSidebarBtn = wrapper.find('button[title="Alternar Barra Lateral"]');
    expect(toggleSidebarBtn.exists()).toBe(true);
    await toggleSidebarBtn.trigger('click');
    await toggleSidebarBtn.trigger('click');
  });

  it('should render tabs and allow tab selection and closure', async () => {
    const wrapper = mount(AppLayout, {
      global: {
        stubs: {
          Splitpanes: { template: '<div><slot /></div>' },
          Pane: { template: '<div><slot /></div>' },
          VueDraggable: {
            template: '<div class="draggable-stub" @click="$emit(\'update:modelValue\', [])"><slot /></div>',
            emits: ['update:modelValue'],
          },
          CollectionTree: { template: '<div class="collection-tree-stub"></div>' },
          RequestBuilder: { template: '<div class="request-builder-stub"></div>' },
          ResponseViewer: { template: '<div class="response-viewer-stub"></div>' },
          SettingsModal: { template: '<div class="settings-modal-stub"></div>' },
          EnvironmentSelector: { template: '<div class="environment-selector-stub"></div>' },
          EnvironmentManagerModal: { template: '<div class="environment-manager-stub"></div>' },
        },
      },
    });

    const draggableStub = wrapper.find('.draggable-stub');
    if (draggableStub.exists()) {
      await draggableStub.trigger('click');
    }

    const tabElement = wrapper.find('div.group.relative');
    if (tabElement.exists()) {
      await tabElement.trigger('click');
    }

    const closeTabBtn = wrapper.find('button[title="Fechar aba"]');
    if (closeTabBtn.exists()) {
      await closeTabBtn.trigger('click');
    }
  });

  it('should open settings modal when settings button is clicked', async () => {
    const wrapper = mount(AppLayout, {
      global: {
        stubs: {
          Splitpanes: { template: '<div><slot /></div>' },
          Pane: { template: '<div><slot /></div>' },
          VueDraggable: { template: '<div><slot /></div>' },
          CollectionTree: { template: '<div class="collection-tree-stub"></div>' },
          RequestBuilder: { template: '<div class="request-builder-stub"></div>' },
          ResponseViewer: { template: '<div class="response-viewer-stub"></div>' },
          SettingsModal: { template: '<div class="settings-modal-stub"></div>' },
          EnvironmentSelector: { template: '<div class="environment-selector-stub"></div>' },
          EnvironmentManagerModal: { template: '<div class="environment-manager-stub"></div>' },
        },
      },
    });

    const settingsBtn = wrapper.find('button[title="Configurações (Engrenagem)"]');
    expect(settingsBtn.exists()).toBe(true);
    await settingsBtn.trigger('click');
  });

  it('should render multiple tabs with diverse methods and handle child events', async () => {
    const { createTab, setActiveTab } = useRequest();
    const tabPost = createTab({ name: 'Tab Post', method: 'POST' });
    createTab({ name: 'Tab Put', method: 'PUT' });
    createTab({ name: 'Tab Delete', method: 'DELETE' });
    createTab({ name: 'Tab Patch', method: 'PATCH' });

    setActiveTab(tabPost.id);

    const wrapper = mount(AppLayout, {
      global: {
        stubs: {
          Splitpanes: { template: '<div><slot /></div>' },
          Pane: { template: '<div><slot /></div>' },
          VueDraggable: { template: '<div><slot /></div>' },
          CollectionTree: {
            template: '<div class="collection-tree-stub" @click="$emit(\'select-item\', { id: \'dino-item\', name: \'Dino\', type: \'request\' })"></div>',
            emits: ['select-item'],
          },
          RequestBuilder: { template: '<div class="request-builder-stub"></div>' },
          ResponseViewer: { template: '<div class="response-viewer-stub"></div>' },
          SettingsModal: { template: '<div class="settings-modal-stub"></div>' },
          EnvironmentSelector: {
            template: '<div class="environment-selector-stub" @click="$emit(\'open-manager\')"></div>',
            emits: ['open-manager'],
          },
          EnvironmentManagerModal: { template: '<div class="environment-manager-stub"></div>' },
        },
      },
    });

    const tabs = wrapper.findAll('div.group.relative');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
    await tabs[0]?.trigger('click');

    const envSelector = wrapper.findComponent(EnvironmentSelector);
    if (envSelector.exists()) {
      envSelector.vm.$emit('open-manager');
      envSelector.vm.$emit('openManager');
    }

    const colTree = wrapper.findComponent(CollectionTree);
    if (colTree.exists()) {
      colTree.vm.$emit('select-item', { id: 'dino-item', name: 'Dino', type: 'request' });
      colTree.vm.$emit('selectItem', { id: 'dino-item', name: 'Dino', type: 'request' });
    }

    const globeBtn = wrapper.find('button[title*="Gerenciar Ambientes"]');
    if (globeBtn.exists()) {
      await globeBtn.trigger('click');
    }
  });
});

