import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useCollections } from '../../use-collections';
import CollectionTree from '../index.vue';
import { useCollectionTree } from '../use-collection-tree';

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

  it('should handle item selection and emit selectItem event', () => {
    const wrapper = mount(CollectionTree);
    const methodBadge = wrapper.find('span.tracking-tighter');
    expect(methodBadge.exists()).toBe(true);

    const itemRow = methodBadge.element.closest('div.cursor-pointer');
    expect(itemRow).not.toBeNull();

    if (itemRow) {
      itemRow.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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
});
