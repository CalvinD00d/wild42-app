import { SITE_CONTENT } from "./site-content.js";

export const NAV_ITEMS = ["About", "Certifications", "Resume", "Contact"] as const;

export type Project = (typeof SITE_CONTENT.projects)[number];
export type NavItem = (typeof NAV_ITEMS)[number];
export type ModalState =
  | { kind: "info"; item: NavItem }
  | { kind: "caseStudy"; project: Project }
  | { kind: "messageSent" }
  | null;
