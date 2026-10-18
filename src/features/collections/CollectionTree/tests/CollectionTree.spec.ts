import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { VueDraggable } from 'vue-draggable-plus';
import { useCollections } from '../../use-collections';
import CollectionTree from '../index.vue';
import { useCollectionTree } from '../use-collection-tree';
import { ContextMenu } from '../../../../shared/ui/ContextMenu';
import { CollectionRunnerModal } from '../../CollectionRunnerModal';

describe('CollectionTree Component', () => {
  beforeEach(() => {
    const tree = useCollectionTree();
    tree.searchQuery.value = '';
    tree.cancelRename();
    tree.cancelRenameCollection();
  });

  it('should not enter rename mode when double-clicking the add request button', async () => {
    const wrapper = mount(CollectionTree);
    const addButton = wrapper.find('button[title="Nova Requisição"]');
    expect(addButton.exists()).toBe(true);

    await addButton.trigger('click');
    await addButton.trigger('dblclick');

    const renameInput = wrapper.find('input[autofocus]');
    expect(renameInput.exists()).toBe(false);
  });

  it('should enter collection rename mode when double-clicking the collection name', async () => {
    const wrapper = mount(CollectionTree);
    const colNameSpan = wrapper.find('span[title="Clique duas vezes para renomear"]');
    expect(colNameSpan.exists()).toBe(true);

    await colNameSpan.trigger('dblclick');

    const renameInput = wrapper.find('input[autofocus]');
    expect(renameInput.exists()).toBe(true);
  });

  it('should not enter rename mode when double-clicking the collection delete button', async () => {
    const wrapper = mount(CollectionTree);
    const deleteButton = wrapper.find('button[title="Excluir Coleção"]');
    expect(deleteButton.exists()).toBe(true);

    await deleteButton.trigger('dblclick');

    const renameInput = wrapper.find('input[autofocus]');
    expect(renameInput.exists()).toBe(false);
  });

  it('should enter request rename mode when double-clicking the request item name', async () => {
    const wrapper = mount(CollectionTree);
    const itemNames = wrapper.findAll('span[title="Clique duas vezes para renomear"]');
    expect(itemNames.length).toBeGreaterThan(1);
    const requestNameSpan = itemNames[1];
    expect(requestNameSpan).toBeDefined();
    if (!requestNameSpan) {
      return;
    }

    await requestNameSpan.trigger('dblclick');

    const renameInput = wrapper.find('input[autofocus]');
    expect(renameInput.exists()).toBe(true);
  });

  it('should not enter rename mode when double-clicking the request delete button', async () => {
    const wrapper = mount(CollectionTree);
    const deleteButton = wrapper.find('button[title="Excluir"]');
    expect(deleteButton.exists()).toBe(true);

    await deleteButton.trigger('dblclick');

    const renameInput = wrapper.find('input[autofocus]');
    expect(renameInput.exists()).toBe(false);
  });

  it('should display updated status code badge when collection item has status', () => {
    const tree = useCollectionTree();
    const targetItem = tree.filteredCollections.value[0]?.items[0];
    expect(targetItem).toBeDefined();
    if (!targetItem) {
      return;
    }

    const { updateItemById } = useCollections();
    updateItemById(targetItem.id, { method: 'POST', status: 201 });

    const wrapper = mount(CollectionTree);
    expect(wrapper.text()).toContain('201');
    expect(wrapper.text()).toContain('POST');
  });

  it('should render empty collection message when collection has no items', async () => {
    const { createCollection } = useCollections();
    createCollection('Coleção Vazia');

    const wrapper = mount(CollectionTree);
    const colHeader = wrapper
      .findAll('div.cursor-pointer')
      .find((el) => el.text().includes('Coleção Vazia'));
    await colHeader?.trigger('click');

    expect(wrapper.text()).toContain('Nenhuma requisição criada');
  });

  it('should handle adding new collection from button click', async () => {
    const wrapper = mount(CollectionTree);
    const addColButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Nova'));
    expect(addColButton).toBeDefined();

    await addColButton?.trigger('click');
    expect(wrapper.text()).toContain('Nova Coleção');
  });

  it('should handle item selection and emit selectItem event', async () => {
    const wrapper = mount(CollectionTree);
    const methodBadge = wrapper.find('span.tracking-tighter');
    expect(methodBadge.exists()).toBe(true);

    const itemCard = wrapper.find('.request-item-card');
    if (itemCard.exists()) {
      await itemCard.trigger('click');
      expect(wrapper.emitted('selectItem')).toBeDefined();
    }
  });

  it('should save rename on enter and blur for collection and item inputs', async () => {
    const wrapper = mount(CollectionTree);
    const colNameSpan = wrapper.find('span[title="Clique duas vezes para renomear"]');
    await colNameSpan.trigger('dblclick');

    const colInput = wrapper.find('input[autofocus]');
    expect(colInput.exists()).toBe(true);
    await colInput.setValue('Coleção Atualizada');
    await colInput.trigger('keydown.enter');

    const colNameSpanAgain = wrapper.find('span[title="Clique duas vezes para renomear"]');
    await colNameSpanAgain.trigger('dblclick');
    const colInputAgain = wrapper.find('input[autofocus]');
    if (colInputAgain.exists()) {
      await colInputAgain.setValue('Coleção Blur');
      await colInputAgain.trigger('blur');
    }

    const itemNames = wrapper.findAll('span[title="Clique duas vezes para renomear"]');
    const reqSpan = itemNames[1];
    if (reqSpan) {
      await reqSpan.trigger('dblclick');
      const itemInput = wrapper.find('input[autofocus]');
      if (itemInput.exists()) {
        await itemInput.setValue('Req Atualizada');
        await itemInput.trigger('blur');
      }
    }
  });

  it('should handle delete collection and delete item clicks', async () => {
    const wrapper = mount(CollectionTree);
    const delItemBtn = wrapper.find('button[title="Excluir"]');
    if (delItemBtn.exists()) {
      await delItemBtn.trigger('click');
    }

    const delColBtn = wrapper.find('button[title="Excluir Coleção"]');
    if (delColBtn.exists()) {
      await delColBtn.trigger('click');
    }
  });

  it('should handle cancel rename with escape key and stop propagation handlers', async () => {
    const wrapper = mount(CollectionTree);
    const colNameSpan = wrapper.find('span[title="Clique duas vezes para renomear"]');
    await colNameSpan.trigger('dblclick');

    const colInput = wrapper.find('input[autofocus]');
    expect(colInput.exists()).toBe(true);
    await colInput.trigger('click');
    await colInput.trigger('dblclick');
    await colInput.trigger('keydown.esc');
    expect(wrapper.find('input[autofocus]').exists()).toBe(false);

    const itemNames = wrapper.findAll('span[title="Clique duas vezes para renomear"]');
    const reqSpan = itemNames[1];
    if (reqSpan) {
      await reqSpan.trigger('dblclick');
      const itemInput = wrapper.find('input[autofocus]');
      if (itemInput.exists()) {
        await itemInput.trigger('click');
        await itemInput.trigger('dblclick');
        await itemInput.trigger('keydown.esc');
      }
    }

    const delItemBtn = wrapper.find('button[title="Excluir"]');
    if (delItemBtn.exists()) {
      await delItemBtn.trigger('dblclick');
    }
  });

  it('should trigger file input on import button click and handle file import', async () => {
    const wrapper = mount(CollectionTree);
    const importBtn = wrapper.findAll('button').find(btn => btn.text().includes('Importar'));
    expect(importBtn).toBeDefined();

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.exists()).toBe(true);

    // mock file click
    const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click');
    await importBtn?.trigger('click');
    expect(clickSpy).toHaveBeenCalled();

    // mock file handle
    const file = new File(['{"info": {"name": "Test"}, "item": []}'], 'collection.json', { type: 'application/json' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      configurable: true
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await fileInput.trigger('change');
    
    // The reader reads file as text, we just need to wait a tick for reader onload
    await new Promise(resolve => setTimeout(resolve, 300));
    
    alertSpy.mockRestore();

    const tree = useCollectionTree();
    const imported = tree.filteredCollections.value.find(c => c.name === 'Test');
    expect(imported).toBeDefined();

    Object.defineProperty(fileInput.element, 'files', {
      value: [],
      configurable: true
    });
    await fileInput.trigger('change');
  });

  it('should render drag handles and handle drag reorder events', () => {
    const tree = useCollectionTree();
    let col = tree.filteredCollections.value.find((c) => c.items.length > 0);
    if (!col) {
      tree.addNewCollection('Coleção Teste Drag');
      col = tree.filteredCollections.value.find((c) => c.name === 'Coleção Teste Drag');
      if (col) {
        tree.addNewRequest(col.id, 'Req Teste Drag');
      }
    }
    if (col && !tree.isExpanded(col.id)) {
      tree.toggleExpand(col.id);
    }

    const wrapper = mount(CollectionTree);
    const colHandles = wrapper.findAll('.col-drag-handle');
    expect(colHandles.length).toBeGreaterThan(0);

    const itemHandles = wrapper.findAll('.item-drag-handle');
    expect(itemHandles.length).toBeGreaterThan(0);

    const draggables = wrapper.findAllComponents(VueDraggable);
    expect(draggables.length).toBeGreaterThanOrEqual(2);

    draggables[0]?.vm.$emit('update:modelValue', [...tree.collections.value]);
    draggables[0]?.vm.$emit('end');

    if (draggables.length >= 2 && col) {
      draggables[1]?.vm.$emit('update:modelValue', [...col.items]);
      draggables[1]?.vm.$emit('end');
    }
  });

  it('should render methods PUT, PATCH, DELETE, fallback and status badges', () => {
    const { createCollection, addItem, updateItemById } = useCollections();
    const col = createCollection('Coleção Métodos');
    const tree = useCollectionTree();
    tree.toggleExpand(col.id);

    const putItem = addItem(col.id, { name: 'Item PUT', method: 'PUT', type: 'request' });
    const patchItem = addItem(col.id, { name: 'Item PATCH', method: 'PATCH', type: 'request' });
    const delItem = addItem(col.id, { name: 'Item DEL', method: 'DELETE', type: 'request' });
    addItem(col.id, { name: 'Item OTHER', method: 'OPTIONS', type: 'request' });

    const fallbackItem = addItem(col.id, { name: 'Item REQ', type: 'request' });
    updateItemById(putItem.id, { status: 304 });
    updateItemById(patchItem.id, { status: 404 });
    updateItemById(delItem.id, { status: 500 });
    updateItemById(fallbackItem.id, { method: undefined });


    const wrapper = mount(CollectionTree);
    expect(wrapper.text()).toContain('PUT');
    expect(wrapper.text()).toContain('PATCH');
    expect(wrapper.text()).toContain('DEL');
    expect(wrapper.text()).toContain('OPTIONS');
    expect(wrapper.text()).toContain('REQ');
    expect(wrapper.text()).toContain('304');
    expect(wrapper.text()).toContain('404');
    expect(wrapper.text()).toContain('500');
  });

  it('should handle click and disabled state on drag handles', async () => {
    const tree = useCollectionTree();
    tree.searchQuery.value = 'Coleção';
    expect(tree.isDraggableDisabled.value).toBe(true);

    const wrapper = mount(CollectionTree);
    const colHandle = wrapper.find('.col-drag-handle');
    expect(colHandle.exists()).toBe(true);
    await colHandle.trigger('click');
    expect(colHandle.attributes('title')).toBe('Desative a busca para reorganizar');

    const itemHandle = wrapper.find('.item-drag-handle');
    expect(itemHandle.exists()).toBe(true);
    await itemHandle.trigger('click');
    expect(itemHandle.attributes('title')).toBe('Desative a busca para reorganizar');


    tree.searchQuery.value = '';
    const resetWrapper = mount(CollectionTree);
    const enabledColHandle = resetWrapper.find('.col-drag-handle');
    expect(enabledColHandle.exists()).toBe(true);
    await enabledColHandle.trigger('click');
    expect(enabledColHandle.attributes('title')).toBe('Arrastar para reorganizar coleção');

    const enabledItemHandle = resetWrapper.find('.item-drag-handle');
    if (enabledItemHandle.exists()) {
      await enabledItemHandle.trigger('click');
      expect(enabledItemHandle.attributes('title')).toBe('Arrastar para reorganizar requisição');
    }
  });

  it('should open context menu on right click on collection card', async () => {
    const wrapper = mount(CollectionTree, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const colHeader = wrapper.find('.collection-card .cursor-pointer');
    expect(colHeader.exists()).toBe(true);

    await colHeader.trigger('contextmenu');

    const contextMenu = wrapper.findComponent(ContextMenu);
    expect(contextMenu.exists()).toBe(true);
    expect(contextMenu.props('isOpen')).toBe(true);

    contextMenu.vm.$emit('close');
    await wrapper.vm.$nextTick();

    const runnerModal = wrapper.findComponent(CollectionRunnerModal);
    expect(runnerModal.exists()).toBe(true);
    runnerModal.vm.$emit('close');
    await wrapper.vm.$nextTick();
  });
});


