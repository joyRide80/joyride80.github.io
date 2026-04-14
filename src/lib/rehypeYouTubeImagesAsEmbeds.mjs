import { getYouTubeEmbedSrc } from "./youtubeEmbedUrl.js";

/** @param {string} s */
function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/** @param {string} attrs */
function readAttr(attrs, name) {
  const reD = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i");
  const reS = new RegExp(`\\b${name}\\s*=\\s*'([^']*)'`, "i");
  const m = reD.exec(attrs) || reS.exec(attrs);
  return m ? m[1] : "";
}

/**
 * @param {string} full
 * @param {string} attrs
 */
function replaceImgTag(full, attrs) {
  const src = readAttr(attrs, "src").trim();
  const embedSrc = getYouTubeEmbedSrc(src);
  if (!embedSrc) return full;

  const alt = readAttr(attrs, "alt").trim();
  const title = alt || "YouTube video player";
  const t = escapeAttr(title);
  const e = escapeAttr(embedSrc);
  return (
    `<div class="project__embed">` +
    `<iframe src="${e}" title="${t}" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
    `referrerpolicy="strict-origin-when-cross-origin" loading="lazy" allowfullscreen></iframe>` +
    `</div>`
  );
}

function patchRawYouTubeImgs(/** @type {import('hast').Root} */ tree) {
  /** @param {unknown} node */
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (
      "type" in node &&
      node.type === "raw" &&
      "value" in node &&
      typeof node.value === "string"
    ) {
      if (!/youtube\.com|youtu\.be/i.test(node.value)) return;
      node.value = node.value.replace(/<img\b([^>]*?)\s*\/>/gi, (full, attrs) =>
        replaceImgTag(full, attrs),
      );
      node.value = node.value.replace(/<img\b([^>]*?)>/gi, (full, attrs) =>
        replaceImgTag(full, attrs),
      );
    }
    if (
      "children" in node &&
      Array.isArray(node.children) &&
      node.children.length
    ) {
      for (const child of node.children) {
        walk(child);
      }
    }
  };
  walk(tree);
}

function replaceElementImgWithYouTubeEmbed(
  /** @type {import('hast').Element} */ node,
) {
  const src = node.properties?.src;
  if (typeof src !== "string") return;
  const embedSrc = getYouTubeEmbedSrc(src);
  if (!embedSrc) return;

  let title = "YouTube video player";
  if (typeof node.properties?.alt === "string" && node.properties.alt.trim()) {
    title = node.properties.alt;
  }

  node.tagName = "div";
  node.properties = { className: ["project__embed"] };
  node.children = [
    {
      type: "element",
      tagName: "iframe",
      properties: {
        src: embedSrc,
        title,
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        referrerPolicy: "strict-origin-when-cross-origin",
        loading: "lazy",
        allowFullscreen: true,
      },
      children: [],
    },
  ];
}

/**
 * Replace `<img src="https://www.youtube.com/...">` with div.project__embed + iframe.
 * Collage output is usually a `raw` HTML string until rehype-raw runs later, so we patch `raw` nodes.
 *
 * Uses a manual walk instead of `unist-util-visit`: some hast trees contain sparse / undefined
 * `children` entries, which makes `visit` throw (`'children' in undefined`).
 */
export function rehypeYouTubeImagesAsEmbeds() {
  return (tree) => {
    patchRawYouTubeImgs(tree);

    /** @param {unknown} node */
    const walkElements = (node) => {
      if (!node || typeof node !== "object") return;
      if (
        "type" in node &&
        node.type === "element" &&
        "tagName" in node &&
        node.tagName === "img"
      ) {
        replaceElementImgWithYouTubeEmbed(
          /** @type {import('hast').Element} */ (node),
        );
      }
      if (
        "children" in node &&
        Array.isArray(node.children) &&
        node.children.length
      ) {
        for (const child of node.children) {
          walkElements(child);
        }
      }
    };
    walkElements(tree);
  };
}
