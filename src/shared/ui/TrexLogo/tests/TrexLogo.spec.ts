import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TrexLogo from '../index.vue';

describe('TrexLogo Component', () => {
  it('should render the logo image with correct src', () => {
    const wrapper = mount(TrexLogo);
    const img = wrapper.find('img');
    
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/logos/Trex.png');
  });

  it('should apply size classes correctly', () => {
    const wrapper = mount(TrexLogo, {
      props: { size: 'lg' }
    });
    
    expect(wrapper.classes()).toContain('w-16');
  });

  it('should render custom src when passed via props', () => {
    const wrapper = mount(TrexLogo, {
      props: { src: '/custom-logo.png' },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('/custom-logo.png');
  });

  it('should render randomized icon when randomize prop is true', () => {
    const wrapper = mount(TrexLogo, {
      props: { randomize: true },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBeTruthy();
    expect(img.attributes('src')).not.toBe('/logos/Trex.png');
  });
});
