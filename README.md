# joy·object site

Portfolio site built with [Astro](https://astro.build).

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Project page layout (markdown + frontmatter)

Project case studies live in `src/content/projects/*.md` and render on `/projects/[slug]`. Layout uses a **4-column CSS grid** (24px gutters) on desktop.

### Hero collage (YAML `heroImages`)

Rendered above the article body in `src/pages/projects/[slug].astro`. Each item has `src`, optional `caption`, and `size`:

| `size`  | Meaning                                      |
| :------ | :------------------------------------------- |
| `large` | Spans **2** columns (two large = one row)    |
| `small` | Spans **1** column (wraps after a full row)  |
| `full`  | Spans **4** columns (full width of the grid) |

### Markdown body (`project__content`)

**Text** — headings, paragraphs, and lists default to **1 column** width, aligned to the first column. For **2-column** body text (one block spanning columns 1–2), wrap content in:

```html
<div class="text-wide">Your markdown paragraphs here.</div>
```

**Two 1-column columns on one row** (left column = grid column 1, right column = grid column 2; each uses the same default type width as a single column, side by side). Put a blank line after each opening `<div>` so markdown inside is parsed:

```html
<div class="text-pair-row">
  <div class="text-pair-row__col">
    First column: markdown paragraphs or lists here.
  </div>
  <div class="text-pair-row__col">Second column: more markdown here.</div>
</div>
```

On **≤1024px** this row stacks into one column. On **≤768px** it stays stacked (same as the rest of the body).

**Images** — placement is set in the **alt text** (parsed at build time by `src/lib/remarkProjectContentCollage.mjs`). After `|span|` / `|col|` are removed, the remainder is shown as a **visible `<figcaption>`** under the image (and used as the `img` `alt` text). A leading word `visible` (case-insensitive) is stripped from that caption only—it is not a special keyword.

```markdown
![Caption text|span:2|col:3](/images/projects/example/screen.png)
```

| Token    | Values | Default | Role                       |
| :------- | :----- | :------ | :------------------------- |
| `span:N` | 1–4    | 2       | How many columns wide      |
| `col:N`  | 1–4    | 1       | Starting column (left = 1) |

`span:4` should use `col:1` (full width). Omit caption text (empty alt) if you want no `<figcaption>`.

**Troubleshooting captions:** The editor’s **Markdown preview** does not run Astro’s remark plugins, so you will not see `<figcaption>` there—use **`npm run dev`** and open the project page in a browser (or run **`npm run build`** and inspect `dist/…/index.html`). View source or DevTools should show `<figcaption>` directly under each placed `<figure>`.

**New row before a placed image** — The grid tries to fill a row, so a short block that only spans columns 1–2 (e.g. `text-pair-row`) can leave column 3 free on the **same** row; the next item with `col:3` may sit beside it. To start the image on the **next** row instead, insert a full-width break **between** the text block and the image:

```html
<div class="project__content-row-break" aria-hidden="true"></div>
```

On **≤768px** (block layout) this break is hidden so it does not add extra space.

**Hero-style collage in the body** — use raw HTML with `class="project__collage"` and tiles `project__collage-item project__collage-item--large` / `--small` / `--full` (same vocabulary as frontmatter). See `src/content/projects/yob.md` for a working example.

### Responsiveness

| Breakpoint   | Layout                                                                                                                                                                  |
| :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **> 1024px** | Full 4-column grid; desktop placement rules apply.                                                                                                                      |
| **≤ 1024px** | **2 columns**: hero title/subtitle full width; intro side-by-side; hero collage 2-col; body grid 2-col (figures span full width so inline placement does not overflow). |
| **≤ 768px**  | **Single column**: stacked layout; body becomes block flow.                                                                                                             |

### Where it lives in code

- **Design tokens & typography:** `.agents/skills/design-system/SKILL.md` (project page section)
- **Hero + collage CSS:** `src/styles/global.css` (`.project__…`)
- **Body grid + prose styles:** `src/pages/projects/[slug].astro` (scoped `<style>`)
- **Image alt → grid placement:** `src/lib/remarkProjectContentCollage.mjs`

## Want to learn more?

[Astro documentation](https://docs.astro.build) · [Astro Discord](https://astro.build/chat)
