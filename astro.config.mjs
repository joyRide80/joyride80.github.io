// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { withBasePublicPath } from "./src/lib/withBasePublicPath.js";
import { remarkPrefixPublicImages } from "./src/lib/remarkPrefixPublicImages.mjs";
import { remarkProjectContentCollage } from "./src/lib/remarkProjectContentCollage.mjs";

const base = "/";

function rehypePrefixBaseAssets() {
  /**
   * @param {any} tree
   */
  return (tree) => {
    /**
     * @param {any} node
     */
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && node.properties) {
        if (typeof node.properties.src === "string") {
          node.properties.src = withBasePublicPath(node.properties.src, base);
        }
        if (typeof node.properties.poster === "string") {
          node.properties.poster = withBasePublicPath(
            node.properties.poster,
            base,
          );
        }
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://joyride80.github.io",
  base,
  devToolbar: {
    enabled: false,
  },
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      remarkPrefixPublicImages(base),
      remarkProjectContentCollage({ baseWithSlash: base }),
    ],
    rehypePlugins: [rehypePrefixBaseAssets],
    shikiConfig: {
      theme: "github-light",
    },
  },
});
