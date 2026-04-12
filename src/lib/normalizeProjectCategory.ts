/**
 * Unify category delimiters from frontmatter (commas, slashes) into " / " segments.
 */
export function normalizeProjectCategory(category: string): string {
  return category
    .split(/[/,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" / ");
}
