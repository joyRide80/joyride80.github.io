/**
 * Sort projects by calendar time using the `year` frontmatter string.
 * Supports single years ("2020") and ranges ("2023-2024", "2014-2015").
 * Uses the latest 4-digit year in the string as the sort key.
 * Tie-break: numeric `order`, then title.
 */

export function projectYearSortKey(year: string): number {
  const matches = year.match(/\d{4}/g);
  if (!matches?.length) return 0;
  return Math.max(...matches.map(Number));
}

export function compareProjectsChronological<
  T extends { year: string; order: number; title?: string },
>(a: T, b: T): number {
  const ya = projectYearSortKey(a.year);
  const yb = projectYearSortKey(b.year);
  if (ya !== yb) return ya - yb;
  if (a.order !== b.order) return a.order - b.order;
  const ta = a.title ?? "";
  const tb = b.title ?? "";
  return ta.localeCompare(tb);
}

/** Astro `getCollection('projects')` entries */
export function compareProjectCollectionEntries(
  a: { data: { year: string; order: number; title: string } },
  b: { data: { year: string; order: number; title: string } },
): number {
  return compareProjectsChronological(a.data, b.data);
}
