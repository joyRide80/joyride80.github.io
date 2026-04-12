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
    introduction: z.string().optional(),
    order: z.number(),
    thumbnail: z.string(),
    timelineImage: z.number().optional().default(0),
    timelineAspect: z.number().optional(),
    timelineCycle: z.boolean().optional().default(false),
    timelineVideoEmbed: z.string().optional(),
    timelineVideoPoster: z.string().optional(),
    heroImages: z
      .array(
        z.object({
          src: z.string(),
          caption: z.string().optional(),
          size: z.enum(["small", "medium", "large", "full"]),
          /** Extra frames; project page script cycles the main `src` through these. */
          cycleImages: z.array(z.string()).optional(),
          /** Cycle through all non-video hero images plus the project thumbnail. */
          cycleProjectPool: z.boolean().optional(),
        }),
      )
      .optional()
      .default([]),
  }),
});

export const collections = {
  projects: projectsCollection,
};
