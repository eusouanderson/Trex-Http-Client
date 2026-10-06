import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

describe('App Component', () => {
  it('should mount App and render AppLayout', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          AppLayout: {
            template: '<div class="app-layout-stub">T-Rex HTTP Client</div>',
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.app-layout-stub').exists()).toBe(true);
  });
});

