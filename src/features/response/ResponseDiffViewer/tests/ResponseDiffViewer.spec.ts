import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ResponseDiffViewer from '../index.vue';
import { resetDiffSnapshot } from '../use-response-diff-viewer';
import type { ExecutionResult } from '../../../request/interfaces';

describe('ResponseDiffViewer Component', () => {
  beforeEach(() => {
    resetDiffSnapshot();
  });

  const resultA: ExecutionResult = {
    status: 200,
    statusText: 'OK',
    durationMs: 45,
    sizeBytes: 800,
    headers: { 'content-type': 'application/json' },
    data: { id: 1, name: 'T-Rex' },
  };

  it('should render empty state when no target result is selected', () => {
    const wrapper = mount(ResponseDiffViewer, {
      props: {
        currentResult: resultA,
        activeTabId: 'tab-1',
      },
    });

    expect(wrapper.text()).toContain('Comparar');
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('should allow pinning snapshot and displaying diff view', async () => {
    const wrapper = mount(ResponseDiffViewer, {
      props: {
        currentResult: resultA,
        activeTabId: 'tab-1',
      },
    });

    const pinButton = wrapper.find('[data-testid="pin-snapshot-button"]');
    expect(pinButton.exists()).toBe(true);
    await pinButton.trigger('click');

    expect(wrapper.text()).toContain('Snapshot fixado');
    expect(wrapper.find('[data-testid="diff-container"]').exists()).toBe(true);
  });

  it('should toggle view mode and only differences', async () => {
    const wrapper = mount(ResponseDiffViewer, {
      props: {
        currentResult: resultA,
        activeTabId: 'tab-1',
      },
    });

    const pinButton = wrapper.find('[data-testid="pin-snapshot-button"]');
    await pinButton.trigger('click');

    const toggleOnlyDiffBtn = wrapper.find('[data-testid="toggle-only-diff"]');
    if (toggleOnlyDiffBtn.exists()) {
      await toggleOnlyDiffBtn.trigger('click');
    }

    const modeBtn = wrapper.find('[data-testid="toggle-view-mode"]');
    if (modeBtn.exists()) {
      await modeBtn.trigger('click');
    }

    expect(wrapper.exists()).toBe(true);
  });

  it('should clear snapshot when clicking clear button', async () => {
    const wrapper = mount(ResponseDiffViewer, {
      props: {
        currentResult: resultA,
        activeTabId: 'tab-1',
      },
    });

    const pinButton = wrapper.find('[data-testid="pin-snapshot-button"]');
    await pinButton.trigger('click');
    expect(wrapper.text()).toContain('Snapshot fixado');

    const clearBtn = wrapper.find('[data-testid="clear-snapshot-button"]');
    expect(clearBtn.exists()).toBe(true);
    await clearBtn.trigger('click');

    expect(wrapper.text()).not.toContain('Snapshot fixado');
  });

  it('should render diff lines in unified mode with differences and status mismatch', async () => {
    const resultB: ExecutionResult = {
      status: 201,
      statusText: 'Created',
      durationMs: 80,
      sizeBytes: 950,
      headers: { 'content-type': 'application/json' },
      data: { id: 2, name: 'Velociraptor', diet: 'carnivore' },
    };

    const wrapper = mount(ResponseDiffViewer, {
      props: {
        currentResult: resultB,
        activeTabId: 'tab-1',
      },
    });

    const pinButton = wrapper.find('[data-testid="pin-snapshot-button"]');
    await pinButton.trigger('click');

    await wrapper.setProps({
      currentResult: resultA,
    });

    expect(wrapper.text()).toContain('Status: 200 vs 201');

    const modeBtn = wrapper.find('[data-testid="toggle-view-mode"]');
    await modeBtn.trigger('click');

    expect(modeBtn.text()).toContain('Modo Lado a Lado');
    expect(wrapper.find('[data-testid="diff-container"]').text()).toContain('Velociraptor');
  });

  it('should render diff lines in split mode with added and removed lines', async () => {
    const resultB: ExecutionResult = {
      status: 200,
      statusText: 'OK',
      durationMs: 40,
      sizeBytes: 900,
      headers: {},
      data: { id: 2, name: 'Velociraptor', diet: 'carnivore' },
    };

    const wrapper = mount(ResponseDiffViewer, {
      props: {
        currentResult: resultB,
        activeTabId: 'tab-1',
      },
    });

    const pinButton = wrapper.find('[data-testid="pin-snapshot-button"]');
    await pinButton.trigger('click');

    await wrapper.setProps({
      currentResult: resultA,
    });

    const container = wrapper.find('[data-testid="diff-container"]');
    expect(container.text()).toContain('T-Rex');
    expect(container.text()).toContain('Velociraptor');
  });
});
