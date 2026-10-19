import anchiornisSrc from '@/icons/anchiornis.png';
import iguanodonSrc from '@/icons/iguanodon.png';
import liopleurodonSrc from '@/icons/liopleurodon.png';
import muttaburrasaurusSrc from '@/icons/muttaburrasaurus.png';
import saltopusSrc from '@/icons/saltopus.png';
import scelidosaurusSrc from '@/icons/scelidosaurus.png';
import stegosaurusSrc from '@/icons/stegosaurus.png';
import triceratopsSrc from '@/icons/triceratops.png';
import velociraptorSrc from '@/icons/velociraptor.png';
import type { ContributorItem, DinosaurIcon, IDinosaurIconService } from './interfaces';

interface ContributorDefinition {
  name: string;
  role: string;
}

const DEFAULT_CONTRIBUTORS: readonly ContributorDefinition[] = [
  { name: 'Anderson Rodrigues da Silva', role: 'Desenvolvedor' },
  { name: 'Lucas Jorge Rosa Silva', role: 'Contribuidor (Uso & Feedbacks)' },
  { name: 'Marcos Roberto de Sousa Kimura', role: 'Contribuidor (Uso & Feedbacks)' },
];

const DEFAULT_FALLBACK_ICON: DinosaurIcon = {
  name: 'velociraptor',
  label: 'Velociraptor',
  src: velociraptorSrc,
};

class DinosaurIconService implements IDinosaurIconService {
  private readonly icons: DinosaurIcon[];
  private readonly themeIconMap: Record<string, string>;

  constructor(
    private readonly randomGenerator: () => number = Math.random,
    customIcons?: DinosaurIcon[],
  ) {
    this.icons = customIcons ?? [
      { name: 'velociraptor', label: 'Velociraptor', src: velociraptorSrc },
      { name: 'liopleurodon', label: 'Liopleurodon', src: liopleurodonSrc },
      { name: 'saltopus', label: 'Saltopus', src: saltopusSrc },
      { name: 'anchiornis', label: 'Anchiornis', src: anchiornisSrc },
      { name: 'triceratops', label: 'Triceratops', src: triceratopsSrc },
      { name: 'stegosaurus', label: 'Stegosaurus', src: stegosaurusSrc },
      { name: 'iguanodon', label: 'Iguanodon', src: iguanodonSrc },
      { name: 'muttaburrasaurus', label: 'Muttaburrasaurus', src: muttaburrasaurusSrc },
      { name: 'scelidosaurus', label: 'Scelidosaurus', src: scelidosaurusSrc },
    ];

    this.themeIconMap = {
      dino: velociraptorSrc,
      'trex-monokai': liopleurodonSrc,
      'raptor-dracula': saltopusSrc,
      'pterodactyl-midnight': anchiornisSrc,
      'triceratops-amber': triceratopsSrc,
      'brachiosaurus-light': stegosaurusSrc,
    };
  }

  public readonly getAllIcons = (): DinosaurIcon[] => {
    return [...this.icons];
  };

  public readonly getRandomIcon = (seed?: number): DinosaurIcon => {
    const value = typeof seed === 'number' ? seed : this.randomGenerator();
    const index = Math.floor(value * this.icons.length) % this.icons.length;
    return this.icons[Math.max(0, index)] ?? DEFAULT_FALLBACK_ICON;
  };

  public readonly getIconByName = (name: string): DinosaurIcon | undefined => {
    return this.icons.find((icon) => icon.name.toLowerCase() === name.toLowerCase());
  };

  public readonly getThemeIcon = (themeId: string): string => {
    return this.themeIconMap[themeId] ?? velociraptorSrc;
  };

  public readonly getContributors = (): ContributorItem[] => {
    const shuffledIcons = [...this.icons].sort(() => this.randomGenerator() - 0.5);

    return DEFAULT_CONTRIBUTORS.map((contributor, index) => {
      const assignedIcon = shuffledIcons[index % shuffledIcons.length] ?? DEFAULT_FALLBACK_ICON;
      return {
        id: `contributor-${String(index + 1)}`,
        name: contributor.name,
        role: contributor.role,
        icon: assignedIcon.src,
        iconName: assignedIcon.label,
      };
    });
  };
}

const dinosaurIconService = new DinosaurIconService();

export { DinosaurIconService, dinosaurIconService };

