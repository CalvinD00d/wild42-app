export const NAV_ITEMS = ["About", "Certifications", "Resume", "Contact", "Video/Photo"] as const;

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  published?: boolean;
  caseStudy?: any;
  designThinking?: any;
  products?: any;
  otherAssets?: any;
  [key: string]: any;
};

export type MediaVideo = { url: string; title: string; category?: string };
export type MediaPhoto = { id: string; src: string; alt: string; category?: string };
export type PortfolioMedia = { videos: MediaVideo[]; photos: MediaPhoto[] };

export const DEFAULT_MEDIA: PortfolioMedia = {
  videos: [{ url: "https://youtu.be/cCsor9e0hjQ", title: "Porsche 991.2 Carrera S | GT International", category: "GT International" }],
  photos: [],
};

export type SiteContent = {
  profile: Record<string, any>;
  nav: Record<string, any>;
  projects: Project[];
  navigation?: NavItem[];
  media?: PortfolioMedia;
  [key: string]: any;
};
export type NavItem = (typeof NAV_ITEMS)[number];
export type InfoNavItem = Exclude<NavItem, "Video/Photo">;
export type ModalState =
  | { kind: "info"; item: InfoNavItem }
  | { kind: "caseStudy"; project: Project }
  | { kind: "videoPhoto" }
  | { kind: "messageSent" }
  | null;
