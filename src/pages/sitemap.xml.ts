import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL("https://joyobject.org");
  const projects = await getCollection("projects");
  const paths = [
    "",
    "about/",
    ...projects.map((project) => `projects/${project.id}/`),
  ];
  const urls = paths
    .map(
      (path) =>
        `  <url><loc>${escapeXml(new URL(path, origin).href)}</loc></url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
