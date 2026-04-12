# Project page markdown — image layout

How body content in `src/content/projects/*.md` is laid out on `/projects/[slug]`, and how that differs from **hero images** in frontmatter.

For a **live copy-paste reference**, see `src/content/projects/yob.md` (equal-width rows, row breaks, and hero-style HTML).

---

## Hero images (frontmatter only)

At the top of each project `.md` file, `heroImages` drives the collage **above** the article body. Each entry has `src`, optional `caption`, and `size`:

- `large` → CSS class `project__collage-item--large` (spans 2 of 5 grid columns)
- `small` → `project__collage-item--small` (spans 1 column)
- `medium` → allowed by the content schema, but **there is no** `.project__collage-item--medium` rule in `src/styles/global.css` yet; prefer `large` / `small` until that exists.

Rendered by `src/pages/projects/[slug].astro` (not from markdown body).

---

## Equal-width image rows (markdown only)

The remark plugin `src/lib/remarkProjectContentCollage.mjs` runs when the collection is built. It wraps **runs** of standalone images in a full-width grid (same gutters as the rest of the project page).

### Two or more images, same row, equal columns

Use **one markdown image per line**, each in its **own paragraph**. Put them **one after another** with only blank lines between (blank lines **do not** end the row).

```markdown
![First](/images/projects/example/a.png)

![Second](/images/projects/example/b.png)
```

That becomes one row; column count follows the number of images (2 → two equal columns; 3 → three; 4+ → 2 columns × multiple rows — see plugin).

### Several images on one line (one paragraph)

Two `![...]()` with no blank line between end up in **one** paragraph; the plugin still detects multiple images and wraps them in the same collage row.

### End the row before the next image

Anything that is **not** an “image-only” paragraph stops the run. The usual trick is an **HTML comment on its own line**:

```markdown
![Second](/images/projects/example/b.png)

<!-- collage: new row -->

![Third full width row below](/images/projects/example/c.png)
```

Use that when the next image should **not** join the previous row (e.g. 2 + 1 layout).

---

## Hero-style asymmetrical grid inside the body

Markdown `![...]()` rows cannot express **large vs small** spans. For the same **5-column collage** as the hero, paste **raw HTML** in the `.md` file (allowed by the markdown pipeline).

Structure (mirror `src/pages/projects/[slug].astro` hero markup):

- Outer: `class="project__collage"`
- Each tile: `project__collage-item` + `project__collage-item--large` **or** `project__collage-item--small`
- Image wrapper: `project__collage-item-media`
- Optional caption: `p` with `class="project__image-caption"`

`src` paths under `/images/...` are prefixed with the site `base` during build (see `astro.config.mjs` `rehypePrefixBaseAssets` and `remarkPrefixPublicImages`).

Full-width collage inside the article grid is enabled with:

- `src/pages/projects/[slug].astro` — `:global(.project__collage)` under `.project__content` (`grid-column: 1 / -1`).

Global sizing rules live in `src/styles/global.css` (`.project__collage`, `.project__collage-item--large`, etc.).

---

## Sorting note (timeline / prev-next)

`year` is the primary sort key; `order` only breaks ties when the derived year is the same. See `src/lib/projectYear.ts`.

---

## Changing behavior

- **Auto equal-width grouping:** `src/lib/remarkProjectContentCollage.mjs`
- **Body + collage CSS:** `src/pages/projects/[slug].astro` (scoped `:global(...)` block)
- **Hero + shared collage CSS:** `src/styles/global.css`
