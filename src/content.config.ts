import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    subtitle: z.string(),
    year: z.string(),
    url: z.string().optional(),
    tags: z.array(z.string()),
    category: z.string(),
    order: z.number(),
    thumbnail: z.string(),
    heroImages: z
      .array(
        z.object({
          src: z.string(),
          caption: z.string().optional(),
          size: z.enum(["small", "medium", "large"]),
        }),
      )
      .optional()
      .default([]),
  }),
});

export const collections = {
  projects: projectsCollection,
};
