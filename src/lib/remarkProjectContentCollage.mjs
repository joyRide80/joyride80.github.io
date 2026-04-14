import { withBasePublicPath } from "./withBasePublicPath.js";
import { getYouTubeEmbedSrc } from "./youtubeEmbedUrl.js";

/**
 * Remark plugin for the 4-column project page grid.
 *
 * Images can carry placement metadata in their alt text:
 *   ![alt text|span:2|col:3](/path/to/image.png)
 *   ![alt|cycle:/a.png,/b.png](/main.png)
 *
 * YouTube watch / youtu.be / embed URLs in `![](…)` render as the same
 * `<figure><div class="project__embed"><iframe>…` block as raw HTML embeds.
 *
 * - span:N  → grid-column span (1–4, default 2)
 * - col:N   → grid-column start (1–4, default 1)
 * - cycle:  → comma-separated URLs/paths; emits data-cycle for always-on page script
 *
 * The plugin strips the metadata from the rendered alt attribute and emits a
 * <figure> with an inline `grid-column` style so the image lands on the
 * correct cell of the parent 4-column CSS grid (.project__content).
 *
 * Images without metadata keep the default CSS placement (span 2 at col 1).
 */

/** @param {string} s */
function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/**
 * Parse "|span:N" and "|col:N" tokens from an image alt string.
 * Returns the clean alt text plus parsed values (null when absent).
 */
/** Strip optional leading "visible " (authors sometimes confuse with a caption toggle). */
function stripVisiblePrefix(s) {
  const t = (s || "").trim();
  const without = t.replace(/^\s*visible\s+/i, "").trim();
  return without.length > 0 ? without : t;
}

function parseImageMeta(altText, baseWithSlash) {
  const cycleMatch = altText.match(/\|cycle:([^|]+)/);
  const cyclePathsRaw = cycleMatch
    ? cycleMatch[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  let rest = altText.replace(/\|cycle:[^|]+/g, "");
  const spanMatch = rest.match(/\|span:(\d+)/);
  const colMatch = rest.match(/\|col:(\d+)/);
  const cleanAlt = rest
    .replace(/\|span:\d+/g, "")
    .replace(/\|col:\d+/g, "")
    .trim();

  const cyclePaths = cyclePathsRaw.map(
    (p) => withBasePublicPath(p, baseWithSlash) ?? p,
  );

  return {
    alt: cleanAlt,
    span: spanMatch
      ? Math.min(Math.max(parseInt(spanMatch[1], 10), 1), 4)
      : null,
    col: colMatch ? Math.min(Math.max(parseInt(colMatch[1], 10), 1), 4) : null,
    cyclePaths,
  };
}

/** @param {import('mdast').Image} img */
function hasPlacementMeta(img) {
  const raw = img.alt || "";
  return (
    /\|span:\d+/.test(raw) || /\|col:\d+/.test(raw) || /\|cycle:/.test(raw)
  );
}

/**
 * Build a <figure> HTML node with inline grid-column for one image.
 * Visible caption: non-empty alt (after stripping |span|/|col|) is rendered as <figcaption>.
 * The img keeps the same string as alt for assistive tech (avoids empty-alt edge cases).
 * @param {import('mdast').Image} img
 */
function buildGridFigure(img, baseWithSlash) {
  const { alt, span, col, cyclePaths } = parseImageMeta(
    img.alt || "",
    baseWithSlash,
  );
  const mainUrl = img.url || "";
  const captionText = stripVisiblePrefix(alt);
  const cleanAlt = escapeAttr(captionText);
  const figcaption =
    captionText.length > 0
      ? `<figcaption>${escapeAttr(captionText)}</figcaption>`
      : "";

  const gridCol = col ?? 1;
  const gridSpan = span ?? 2;

  const youtubeSrc = getYouTubeEmbedSrc(mainUrl);
  if (youtubeSrc) {
    const iframeSrc = escapeAttr(youtubeSrc);
    const iframeTitle =
      captionText.length > 0 ? cleanAlt : escapeAttr("YouTube video player");
    return {
      type: "html",
      value:
        `<figure style="grid-column:${gridCol}/span ${gridSpan}">` +
        `<div class="project__embed">` +
        `<iframe src="${iframeSrc}" title="${iframeTitle}" ` +
        `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
        `referrerpolicy="strict-origin-when-cross-origin" loading="lazy" allowfullscreen></iframe>` +
        `</div>` +
        figcaption +
        `</figure>`,
    };
  }

  const prefixedUrl = withBasePublicPath(mainUrl, baseWithSlash) ?? mainUrl;
  const src = escapeAttr(prefixedUrl);

  const mainPrefixed = withBasePublicPath(mainUrl, baseWithSlash) ?? mainUrl;
  let pool = cyclePaths.length ? [...cyclePaths] : [];
  if (pool.length && mainPrefixed && !pool.includes(mainPrefixed)) {
    pool = [mainPrefixed, ...pool];
  }
  const cycleAttr =
    pool.length >= 2 ? ` data-cycle="${escapeAttr(JSON.stringify(pool))}"` : "";

  return {
    type: "html",
    value:
      `<figure style="grid-column:${gridCol}/span ${gridSpan}">` +
      `<img src="${src}" alt="${cleanAlt}" loading="lazy"${cycleAttr} />` +
      figcaption +
      `</figure>`,
  };
}

/** @param {import('mdast').Paragraph} node */
function isParagraphLoneImage(node) {
  if (node.type !== "paragraph") return false;
  const meaningful =
    node.children?.filter((c) => {
      if (c.type === "text") return c.value.trim() !== "";
      return true;
    }) ?? [];
  return meaningful.length === 1 && meaningful[0].type === "image";
}

/**
 * A paragraph containing only images (and optional whitespace).
 * @param {import('mdast').Paragraph} node
 * @returns {import('mdast').Image[] | null}
 */
function paragraphOnlyImages(node) {
  if (node.type !== "paragraph") return null;
  /** @type {import('mdast').Image[]} */
  const imgs = [];
  for (const c of node.children ?? []) {
    if (c.type === "image") imgs.push(c);
    else if (c.type === "text") {
      if (c.value.trim() !== "") return null;
    } else if (c.type === "break") {
      // Two `![…](…)` lines without a blank line → one paragraph, often image + break + image
      continue;
    } else {
      return null;
    }
  }
  return imgs.length >= 2 ? imgs : null;
}

/** @param {{ baseWithSlash?: string }} [options] — same attacher shape as `remarkPrefixPublicImages`. */
export function remarkProjectContentCollage(options = {}) {
  const baseWithSlash = options.baseWithSlash ?? "/";
  return () => {
    /** @param {import('mdast').Root} tree */
    return (tree) => {
      if (!tree?.children?.length) return;

      /** @type {import('mdast').RootContent[]} */
      const next = [];
      const { children } = tree;

      for (let i = 0; i < children.length; i++) {
        const node = children[i];

        if (node.type !== "paragraph") {
          next.push(node);
          continue;
        }

        const inlineImages = paragraphOnlyImages(node);
        if (inlineImages) {
          for (const img of inlineImages) {
            next.push(buildGridFigure(img, baseWithSlash));
          }
          continue;
        }

        if (isParagraphLoneImage(node)) {
          const img = node.children.find((c) => c.type === "image");
          if (img && hasPlacementMeta(img)) {
            next.push(buildGridFigure(img, baseWithSlash));
          } else if (img) {
            next.push(buildGridFigure(img, baseWithSlash));
          } else {
            next.push(node);
          }
          continue;
        }

        next.push(node);
      }

      tree.children = next;
    };
  };
}
