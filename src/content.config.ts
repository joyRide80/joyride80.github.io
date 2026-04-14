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
    urlHref: z.string().optional(),
    urlLabel: z.string().optional(),
    tags: z.array(z.string()),
    category: z.string(),
    introduction: z.string().optional(),
    order: z.number(),
    thumbnail: z.string(),
    /** Index into `heroImages` for the timeline tile, or `-1` for `thumbnail`. With `-1`, timeline cycle uses only thumbnail + `timelineCycleImages` (no hero `src`s). */
    timelineImage: z.number().optional().default(0),
    timelineAspect: z.number().optional(),
    timelineCycle: z.boolean().optional().default(false),
    /** Extra stills for the timeline strip when `timelineCycle` is true (URLs need not appear in the MD body). */
    timelineCycleImages: z.array(z.string()).optional(),
    timelineVideoEmbed: z.string().optional(),
    timelineVideoPoster: z.string().optional(),
    heroImages: z
      .array(
        z
          .object({
            src: z.string().optional(),
            caption: z.string().optional(),
            size: z.enum(["small", "small-split", "medium", "large", "full"]),
            splitImages: z.array(z.string()).optional(),
            /** Extra frames; project page script cycles the main `src` through these. */
            cycleImages: z.array(z.string()).optional(),
            /** Cycle through all non-video hero images plus the project thumbnail. */
            cycleProjectPool: z.boolean().optional(),
            /** Vimeo / YouTube iframe `src` for a hero tile (use without `src` for embed-only). */
            videoEmbed: z.string().optional(),
            /** Use portrait (9:16) embed box; default is 16:9. */
            embedVertical: z.boolean().optional().default(false),
            /** Overlay a video on top of the main `src` background. */
            overlayVideo: z.string().optional(),
            /** Width of the overlay video (e.g. "60%", "800px"). Defaults to 60%. */
            overlayVideoWidth: z.string().optional(),
          })
          .refine(
            (d) =>
              Boolean(d.src?.trim()) ||
              Boolean(d.videoEmbed?.trim()) ||
              Boolean(d.splitImages?.length),
            {
              message:
                "Each heroImages entry needs `src`, `videoEmbed` or `splitImages`",
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
