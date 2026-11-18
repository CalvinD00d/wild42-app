import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { NAV_ITEMS, type SiteContent } from "@/app/_components/portfolio-types";

import { youtubeVideoId } from "@/app/_components/youtube-video";

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
  const { navigation, media } = content;
  if (navigation !== undefined && (
    !Array.isArray(navigation) ||
    navigation.length !== NAV_ITEMS.length ||
    NAV_ITEMS.some((item) => !navigation.includes(item))
  )) throw new Error("Navigation must include every menu item once.");

  if (media === undefined) return;
  if (!media || !Array.isArray(media.videos) || !Array.isArray(media.photos)) {
    throw new Error("Media must include video and photo lists.");
  }
  const videoIds = new Set<string>();
  for (const [index, video] of media.videos.entries()) {
    const id = typeof video?.url === "string" ? youtubeVideoId(video.url) : null;
    if (!id || typeof video.title !== "string" || !video.title.trim()) {
      throw new Error(`Video ${index + 1} needs a YouTube video URL and title.`);
    }
    if (video.category !== undefined && typeof video.category !== "string") {
      throw new Error(`Video ${index + 1} needs a text category.`);
    }
    if (videoIds.has(id)) throw new Error(`Video ${index + 1} is already in the list.`);
    videoIds.add(id);
  }
  const photoIds = new Set<string>();
  for (const [index, photo] of media.photos.entries()) {
    if (!photo || typeof photo.id !== "string" || !photo.id.trim() ||
        typeof photo.src !== "string" || !/^\/(?:assets|uploads)\/[\w./%-]+\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(photo.src) ||
        photo.src.includes("..") || /%2e|%2f|%5c/i.test(photo.src) ||
        typeof photo.alt !== "string" || !photo.alt.trim()) {
      throw new Error(`Photo ${index + 1} needs a local image path and alt text.`);
    }
    if (photo.category !== undefined && typeof photo.category !== "string") {
      throw new Error(`Photo ${index + 1} needs a text category.`);
    }
    if (photoIds.has(photo.id)) throw new Error(`Duplicate photo ID on photo ${index + 1}.`);
    photoIds.add(photo.id);
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
  console.log("Saving content to:", target);
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
