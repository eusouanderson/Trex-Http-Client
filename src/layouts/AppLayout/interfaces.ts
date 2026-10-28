type SidebarTab = 'collections' | 'history';
type LayoutStage = 'full' | 'compact' | 'focus';

interface AppLayoutProps {
  initialSidebarOpen?: boolean;
}

export type { SidebarTab, LayoutStage, AppLayoutProps };
