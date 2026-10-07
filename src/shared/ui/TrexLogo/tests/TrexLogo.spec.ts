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
});

