import type { ContributorItem, DinosaurIcon, IDinosaurIconService } from './interfaces';

interface ContributorDefinition {
  name: string;
  role: string;
}

const buildIconPath = (fileName: string): string => {
  return `${import.meta.env.BASE_URL}icons/${fileName}.png`;
};

const VELOCIRAPTOR_SRC = buildIconPath('velociraptor');
const LIOPLEURODON_SRC = buildIconPath('liopleurodon');
const SALTOPUS_SRC = buildIconPath('saltopus');
const ANCHIORNIS_SRC = buildIconPath('anchiornis');
const TRICERATOPS_SRC = buildIconPath('triceratops');
const STEGOSAURUS_SRC = buildIconPath('stegosaurus');
const IGUANODON_SRC = buildIconPath('iguanodon');
const MUTTABURRASAURUS_SRC = buildIconPath('muttaburrasaurus');
const SCELIDOSAURUS_SRC = buildIconPath('scelidosaurus');

const DEFAULT_CONTRIBUTORS: readonly ContributorDefinition[] = [
  { name: 'Anderson Rodrigues da Silva', role: 'Desenvolvedor' },
  { name: 'Lucas Jorge Rosa Silva', role: 'Contribuidor (Uso & Feedbacks)' },
  { name: 'Marcos Roberto de Sousa Kimura', role: 'Contribuidor (Uso & Feedbacks)' },
];

const DEFAULT_FALLBACK_ICON: DinosaurIcon = {
  name: 'velociraptor',
  label: 'Velociraptor',
  src: VELOCIRAPTOR_SRC,
};

class DinosaurIconService implements IDinosaurIconService {
  private readonly icons: DinosaurIcon[];
  private readonly themeIconMap: Record<string, string>;

  constructor(
    private readonly randomGenerator: () => number = Math.random,
    customIcons?: DinosaurIcon[],
  ) {
    this.icons = customIcons ?? [
      { name: 'velociraptor', label: 'Velociraptor', src: VELOCIRAPTOR_SRC },
      { name: 'liopleurodon', label: 'Liopleurodon', src: LIOPLEURODON_SRC },
      { name: 'saltopus', label: 'Saltopus', src: SALTOPUS_SRC },
      { name: 'anchiornis', label: 'Anchiornis', src: ANCHIORNIS_SRC },
      { name: 'triceratops', label: 'Triceratops', src: TRICERATOPS_SRC },
      { name: 'stegosaurus', label: 'Stegosaurus', src: STEGOSAURUS_SRC },
      { name: 'iguanodon', label: 'Iguanodon', src: IGUANODON_SRC },
      { name: 'muttaburrasaurus', label: 'Muttaburrasaurus', src: MUTTABURRASAURUS_SRC },
      { name: 'scelidosaurus', label: 'Scelidosaurus', src: SCELIDOSAURUS_SRC },
    ];

    this.themeIconMap = {
      dino: VELOCIRAPTOR_SRC,
      'trex-monokai': LIOPLEURODON_SRC,
      'raptor-dracula': SALTOPUS_SRC,
      'pterodactyl-midnight': ANCHIORNIS_SRC,
      'triceratops-amber': TRICERATOPS_SRC,
      'brachiosaurus-light': STEGOSAURUS_SRC,
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
    return this.themeIconMap[themeId] ?? VELOCIRAPTOR_SRC;
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

