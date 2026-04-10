/**
 * Prefix root-relative public files (/images/...) with the site base.
 * @param {string | undefined} path
 * @param {string} baseWithSlash e.g. import.meta.env.BASE_URL or "/joyObjectSite/"
 */
export function withBasePublicPath(path, baseWithSlash) {
  if (!path || typeof path !== "string") return path;
  if (
    /^(https?:)?\/\//i.test(path) ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const trimmedBase = baseWithSlash.replace(/\/$/, "");
  if (!path.startsWith("/")) return path;
  if (!path.startsWith("/images/")) return path;
  if (path.startsWith(`${trimmedBase}/`)) return path;
  return `${trimmedBase}${path}`;
}
