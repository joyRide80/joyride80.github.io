import { visit } from "unist-util-visit";
import { withBasePublicPath } from "./withBasePublicPath.js";

/**
 * Rewrite raw HTML attribute values for public /images/ paths (embedded <img>, etc.).
 * @param {string} html
 * @param {string} baseWithSlash
 */
function rewriteHtmlPublicAssetAttrs(html, baseWithSlash) {
  return html.replace(
    /\b(src|poster|data-cycle)\s*=\s*(["'])([\s\S]*?)\2/gi,
    (full, attr, quote, inner) => {
      const a = String(attr).toLowerCase();
      if (a === "data-cycle") {
        const parts = inner.split(",").map((s) => {
          const t = s.trim();
          return withBasePublicPath(t, baseWithSlash) ?? t;
        });
        return `${attr}=${quote}${parts.join(",")}${quote}`;
      }
      const trimmed = inner.trim();
      return `${attr}=${quote}${withBasePublicPath(trimmed, baseWithSlash)}${quote}`;
    },
  );
}

/**
 * Remark plugin: content collections compile markdown with remark; rehype from
 * astro.config often does not run on that path, so we fix URLs here (md + raw HTML).
 * @param {string} baseWithSlash
 */
export function remarkPrefixPublicImages(baseWithSlash) {
  return () => (tree) => {
    visit(tree, "image", (node) => {
      if (node.url) {
        node.url = withBasePublicPath(node.url, baseWithSlash) ?? node.url;
      }
    });
    visit(tree, "html", (node) => {
      if (typeof node.value === "string") {
        node.value = rewriteHtmlPublicAssetAttrs(node.value, baseWithSlash);
      }
    });
  };
}
