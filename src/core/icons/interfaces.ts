interface DinosaurIcon {
  name: string;
  label: string;
  src: string;
}

interface ContributorItem {
  id: string;
  name: string;
  role: string;
  icon: string;
  iconName: string;
}

interface IDinosaurIconService {
  getAllIcons(): DinosaurIcon[];
  getRandomIcon(seed?: number): DinosaurIcon;
  getIconByName(name: string): DinosaurIcon | undefined;
  getThemeIcon(themeId: string): string;
  getContributors(): ContributorItem[];
}

export type { DinosaurIcon, ContributorItem, IDinosaurIconService };

