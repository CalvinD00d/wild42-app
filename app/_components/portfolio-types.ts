export const NAV_ITEMS = ["About", "Certifications", "Resume", "Contact"] as const;

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

export type SiteContent = {
  profile: Record<string, any>;
  nav: Record<string, any>;
  projects: Project[];
  [key: string]: any;
};
export type NavItem = (typeof NAV_ITEMS)[number];
export type ModalState =
  | { kind: "info"; item: NavItem }
  | { kind: "caseStudy"; project: Project }
  | { kind: "messageSent" }
  | null;
