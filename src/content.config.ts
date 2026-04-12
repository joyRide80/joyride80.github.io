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
        z
          .object({
            src: z.string().optional(),
            caption: z.string().optional(),
            size: z.enum(["small", "medium", "large", "full"]),
            /** Extra frames; project page script cycles the main `src` through these. */
            cycleImages: z.array(z.string()).optional(),
            /** Cycle through all non-video hero images plus the project thumbnail. */
            cycleProjectPool: z.boolean().optional(),
            /** Vimeo / YouTube iframe `src` for a hero tile (use without `src` for embed-only). */
            videoEmbed: z.string().optional(),
            /** Use portrait (9:16) embed box; default is 16:9. */
            embedVertical: z.boolean().optional().default(false),
          })
          .refine(
            (d) => Boolean(d.src?.trim()) || Boolean(d.videoEmbed?.trim()),
            {
              message: "Each heroImages entry needs `src` and/or `videoEmbed`",
            },
          ),
      )
      .optional()
      .default([]),
  }),
});

export const collections = {
  projects: projectsCollection,
};
