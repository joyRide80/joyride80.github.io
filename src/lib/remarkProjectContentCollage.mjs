/**
 * Wrap runs of consecutive markdown image paragraphs in a full-width grid container.
 * Uses remark (not rehype) so content-collection pre-render picks it up — the glob loader
 * snapshots rendered HTML before page Vite plugins run.
 */

/** @param {string} s */
function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
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

/** @param {number} n */
function collageColsForCount(n) {
  if (n <= 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 2;
}

/**
 * @param {import('mdast').RootContent[]} children
 * @param {number} i
 */
function collectConsecutiveImageParagraphs(children, i) {
  /** @type {import('mdast').Paragraph[]} */
  const group = [];
  let j = i;
  while (j < children.length) {
    const n = children[j];
    if (n.type === "paragraph" && isParagraphLoneImage(n)) {
      group.push(n);
      j++;
      continue;
    }
    break;
  }
  return { group, next: j };
}

/**
 * @param {import('mdast').Paragraph[]} group
 */
function buildCollageHtmlNode(group) {
  const cols = collageColsForCount(group.length);
  const inner = group
    .map((p) => {
      const img = p.children.find((c) => c.type === "image");
      if (!img || img.type !== "image") return "";
      const src = escapeAttr(img.url || "");
      const alt = escapeAttr(img.alt || "");
      return `<p><img src="${src}" alt="${alt}" loading="lazy"></p>`;
    })
    .join("");
  return {
    type: "html",
    value: `<div class="project__content-collage" style="--collage-cols:${cols}">${inner}</div>`,
  };
}

export function remarkProjectContentCollage() {
  /**
   * @param {import('mdast').Root} tree
   */
  return (tree) => {
    if (!tree.children?.length) return;

    /** @type {import('mdast').RootContent[]} */
    const next = [];
    let i = 0;
    const { children } = tree;

    while (i < children.length) {
      const node = children[i];
      if (node.type === "paragraph" && isParagraphLoneImage(node)) {
        const { group, next: end } = collectConsecutiveImageParagraphs(
          children,
          i,
        );
        if (group.length >= 2) {
          next.push(buildCollageHtmlNode(group));
          i = end;
        } else {
          next.push(node);
          i = end;
        }
      } else {
        next.push(node);
        i++;
      }
    }

    tree.children = next;
  };
}
