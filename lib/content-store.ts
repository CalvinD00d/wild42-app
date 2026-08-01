import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteContent } from "@/app/_components/portfolio-types";

const contentPath = () =>
  process.env.PORTFOLIO_CONTENT_FILE ||
  path.join(/* turbopackIgnore: true */ process.cwd(), "content", "site-content.json");

function validateContent(value: unknown): asserts value is SiteContent {
  if (!value || typeof value !== "object") throw new Error("Content must be an object.");
  const content = value as SiteContent;
  if (!Array.isArray(content.projects)) throw new Error("Content must include a projects array.");
  const slugs = new Set<string>();
  for (const [index, project] of content.projects.entries()) {
    if (!project || typeof project !== "object") throw new Error(`Project ${index + 1} is invalid.`);
    if (!project.slug?.trim() || !project.title?.trim()) throw new Error(`Project ${index + 1} needs a slug and title.`);
    if (slugs.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
    slugs.add(project.slug);
  }
}

export async function readContent(): Promise<SiteContent> {
  const raw = await readFile(contentPath(), "utf8");
  const content: unknown = JSON.parse(raw);
  validateContent(content);
  return content;
}

export async function readPublicContent(): Promise<SiteContent> {
  const content = await readContent();
  return { ...content, projects: content.projects.filter((project) => project.published !== false) };
}

export async function writeContent(content: unknown): Promise<SiteContent> {
  validateContent(content);
  const target = contentPath();
  const directory = path.dirname(target);
  const backupDirectory = path.join(directory, "backups");
  await mkdir(backupDirectory, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-");
  try {
    await writeFile(path.join(backupDirectory, `site-content-${stamp}.json`), await readFile(target));
  } catch {}
  const temporary = `${target}.tmp`;
  await writeFile(temporary, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporary, target);
  return content;
}
