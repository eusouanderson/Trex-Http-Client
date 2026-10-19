import { describe, expect, it } from 'vitest';
import { DinosaurIconService } from '../dinosaur-icon.service';

describe('DinosaurIconService', () => {
  const service = new DinosaurIconService();

  it('should return all 9 dinosaur icons with name, label and src', () => {
    const icons = service.getAllIcons();

    expect(icons).toHaveLength(9);
    for (const icon of icons) {
      expect(icon.name).toBeTruthy();
      expect(icon.label).toBeTruthy();
      expect(icon.src).toBeTruthy();
    }
  });

  it('should get an icon by name when it exists', () => {
    const icon = service.getIconByName('velociraptor');

    expect(icon).toBeDefined();
    expect(icon?.name).toBe('velociraptor');
    expect(icon?.label).toBe('Velociraptor');
  });

  it('should return undefined when icon is not found by name', () => {
    const icon = service.getIconByName('inexistente');

    expect(icon).toBeUndefined();
  });

  it('should return a random icon from the available collection', () => {
    const icon = service.getRandomIcon();
    expect(icon).toBeDefined();
    expect(service.getAllIcons()).toContainEqual(icon);

    const specificIcon = service.getRandomIcon(0.5);
    expect(specificIcon).toBeDefined();
  });

  it('should map theme ids to expected dinosaur icon sources', () => {
    expect(service.getThemeIcon('dino')).toBe(service.getIconByName('velociraptor')?.src);
    expect(service.getThemeIcon('trex-monokai')).toBe(service.getIconByName('liopleurodon')?.src);
    expect(service.getThemeIcon('raptor-dracula')).toBe(service.getIconByName('saltopus')?.src);
    expect(service.getThemeIcon('pterodactyl-midnight')).toBe(service.getIconByName('anchiornis')?.src);
    expect(service.getThemeIcon('triceratops-amber')).toBe(service.getIconByName('triceratops')?.src);
    expect(service.getThemeIcon('brachiosaurus-light')).toBe(service.getIconByName('stegosaurus')?.src);
    expect(service.getThemeIcon('unknown-theme')).toBe(service.getIconByName('velociraptor')?.src);
  });

  it('should return list of contributors with randomized icons', () => {
    const contributors = service.getContributors();

    expect(contributors).toHaveLength(3);
    expect(contributors[0]?.name).toBe('Anderson Rodrigues da Silva');
    expect(contributors[0]?.role).toBe('Desenvolvedor');
    expect(contributors[1]?.name).toBe('Lucas Jorge Rosa Silva');
    expect(contributors[1]?.role).toBe('Contribuidor (Uso & Feedbacks)');
    expect(contributors[2]?.name).toBe('Marcos Roberto de Sousa Kimura');
    expect(contributors[2]?.role).toBe('Contribuidor (Uso & Feedbacks)');

    for (const contributor of contributors) {
      expect(contributor.id).toBeTruthy();
      expect(contributor.icon).toBeTruthy();
      expect(contributor.iconName).toBeTruthy();
      expect(contributor.role).toBeTruthy();
    }
  });

  it('should allow custom randomizer function for contributors', () => {
    const deterministicService = new DinosaurIconService(() => 0.1);
    const contributors = deterministicService.getContributors();

    expect(contributors).toHaveLength(3);
    expect(contributors[0]?.icon).toBeTruthy();
  });

  it('should fallback to default icon when custom icons array is empty', () => {
    const emptyService = new DinosaurIconService(Math.random, []);
    const icon = emptyService.getRandomIcon();
    expect(icon.name).toBe('velociraptor');

    const contributors = emptyService.getContributors();
    expect(contributors[0]?.iconName).toBe('Velociraptor');
  });
});

