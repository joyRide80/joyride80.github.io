import { withBasePublicPath } from "./withBasePublicPath.js";

type ProjectLike = {
  thumbnailImages?: string[];
  thumbnail?: string;
  heroImages?: { src?: string }[];
};

/**
 * Normalized URLs for home cloud + timeline strip.
 * Order: explicit `thumbnailImages`, else `thumbnail`, else first hero `src`.
 */
export function homeStripImagePaths(
  project: ProjectLike,
  baseUrl: string,
): string[] {
  const list = project.thumbnailImages;
  if (Array.isArray(list) && list.length > 0) {
    return list
      .map((u) => withBasePublicPath(u, baseUrl) ?? u)
      .filter((u): u is string => Boolean(u && String(u).trim()));
  }
  const t = project.thumbnail?.trim();
  if (t) return [withBasePublicPath(t, baseUrl) ?? t].filter(Boolean);
  const hero = project.heroImages?.find((h) => h.src?.trim())?.src;
  if (hero) return [withBasePublicPath(hero, baseUrl) ?? hero].filter(Boolean);
  return [];
}
