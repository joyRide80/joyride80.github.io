# Home strip images (`thumbnailImages`)

Used on **Cloud** (2–3 tiles per project, cycling URLs from this list) and **Timeline** (first list entry only). Keep files **small**: Slow 4G is sensitive to total megabytes, not only dimensions.

## Still images (recommended default)

| Target                         | Suggested max width | Format                                                |
| ------------------------------ | ------------------- | ----------------------------------------------------- |
| Strip tiles (cloud + timeline) | **320–480 px** wide | **WebP** or AVIF; PNG only when you need transparency |

Encode aggressively (e.g. Squoosh). The on-screen tile is small; extra resolution is wasted bandwidth.

## Tiny video on Cloud / Timeline

If you include **`.mp4`** or **`.webm`** in `thumbnailImages`:

| Setting    | Suggestion                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Resolution | **480p max** (e.g. 854×480 or 480×480); often **360p** is enough for a tile                                            |
| Duration   | **1–3 s** loops feel alive without huge files                                                                          |
| Codec      | **H.264** (baseline) + **AAC** if audio (often muted on site); or **VP9** in **WebM** for smaller size at same quality |
| File size  | Aim **under ~500 KB–1.5 MB** per loop for portfolio tiles on cellular                                                  |

Strip **videos** use **muted, looping autoplay** on Cloud and Timeline. In `cloud.js`, playback starts only while each tile is **in or near the viewport** (IntersectionObserver); off-screen tiles **pause** so Slow 4G and CPU are not saturated. Strip **images** use **`decoding="async"`**, **`fetchpriority`** (high for the first cloud tiles and the timeline tiles near the scroll end), and **`loading="eager"`** only for those priority tiles.

## GIF vs short video

|                    | GIF                                                       | MP4/WebM                                  |
| ------------------ | --------------------------------------------------------- | ----------------------------------------- |
| **Quality / size** | Poor for photo-like frames; large files for smooth motion | Much better compression for the same look |
| **Decoding**       | Often heavy on mobile CPUs                                | Hardware decode is common                 |

**Recommendation:** Prefer a **short, muted MP4 or WebM loop** over GIF for motion on the home page. Reserve GIF for very short, flat graphics (few colours) if you must.

## Fallback behaviour

If **`thumbnailImages`** is omitted, the build falls back to **`thumbnail`**, then the first hero **`src`**. Prefer defining **`thumbnailImages`** explicitly so Cloud and Timeline never pull accidental large heroes.
