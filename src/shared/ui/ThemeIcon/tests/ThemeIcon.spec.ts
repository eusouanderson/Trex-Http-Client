import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeIcon from '../index.vue';

describe('ThemeIcon Component', () => {
  it('should render emoji text when icon is not an image', () => {
    const wrapper = mount(ThemeIcon, {
      props: {
        icon: '🦖',
        size: 'md',
      },
    });

    expect(wrapper.find('span').exists()).toBe(true);
    expect(wrapper.find('span').text()).toBe('🦖');
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('should render img when icon is a logo path', () => {
    const wrapper = mount(ThemeIcon, {
      props: {
        icon: 'logos/Trex.png',
        size: 'lg',
        alt: 'Logo T-Rex',
      },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Logo T-Rex');
    expect(img.attributes('src')).toContain('logos/Trex.png');
  });
});

