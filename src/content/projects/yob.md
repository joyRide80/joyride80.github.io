---
title: "YOB"
headline: "Launching YOB"
subtitle: "From vision to prototype: making plumbing services predictable"
year: "2024-2025"
url: "yob.no"
tags:
  - "Branding & Visual Identity"
  - "Design systems"
  - "Rapid Prototyping"
  - "Product Strategy"
category: "ServiceTech / HomeTech"
introduction: "YOB is a mobile-first platform designed to simplify the process of hiring a plumber by offering fixed prices and a seamless booking experience. It solves the common frustrations of home maintenance: high price uncertainty and fragmented communication between homeowners and professionals."
order: 7
thumbnail: ""
thumbnailImages:
  - "/images/projects/klara/tiny_transaction-page.png"
  - "/images/projects/klara/tiny_emission-page.png"
  - "/images/projects/klara/tiny_thumbnail.png"
heroImages:
  - src: "/images/projects/klara/transaction-page.png"
    caption: "Transaction page"
    size: "large"
  - src: "/images/projects/klara/emission-page.png"
    caption: "Emission page"
    size: "large"
  - src: "/images/projects/klara/thumbnail.png"
    caption: "Klara brand"
    size: "small"
---

## My approach and results

As the lead designer, I was responsible for translating this vision into a tangible product. I built the brand from the ground up, established a comprehensive design system, and conducted deep-dive user interviews to ensure the UX addressed real-world pain points. Through rapid prototyping and concept development, I shaped a platform that makes booking a plumber as predictable and easy as any modern digital service.

<!--
  imageA + imageB: two image-only paragraphs in a row → one row, equal width.
  Blank lines between A and B do NOT break the row.
  Before imageC, put a row-break HTML comment on its own line (same as the
  "collage: new row" line used under Case study placeholders).
  Replace /images/... paths with your real files when you ship.
-->

![imageA](/images/projects/klara/thumbnail.png)

![imageB](/images/projects/klara/emission-page.png)

<!-- collage: new row -->

![imageC](/images/projects/klara/overview-page.png)

## Hero-style grid in the body (large / small)

Use the same markup as the hero collage: a `project__collage` wrapper and each
tile is a `project__collage-item` plus either `project__collage-item--large`
(span 2 columns) or `project__collage-item--small` (span 1 column). Put the
image inside `project__collage-item-media`. Optional caption:
`p` with class `project__image-caption`.

Frontmatter `heroImages` / `size: large | small` only applies to the collage
**above** the article body. Inside markdown you choose large vs small by
picking the class on each tile (`--large` or `--small`). The schema also allows
`medium` for hero YAML, but there is no matching CSS class in the stylesheet
yet—stick to large and small in HTML until that exists.

<div class="project__collage">
  <div class="project__collage-item project__collage-item--large">
    <div class="project__collage-item-media">
      <img src="/images/projects/klara/transaction-page.png" alt="imageA mock (large tile)" loading="lazy" />
    </div>
    <p class="project__image-caption">imageA — large</p>
  </div>
  <div class="project__collage-item project__collage-item--large">
    <div class="project__collage-item-media">
      <img src="/images/projects/klara/emission-page.png" alt="imageB mock (large tile)" loading="lazy" />
    </div>
    <p class="project__image-caption">imageB — large</p>
  </div>
  <div class="project__collage-item project__collage-item--small">
    <div class="project__collage-item-media">
      <img src="/images/projects/klara/thumbnail.png" alt="imageC mock (small tile)" loading="lazy" />
    </div>
    <p class="project__image-caption">imageC — small</p>
  </div>
</div>

## Case study placeholders (replace with YOB assets)

![Transaction page](/images/projects/klara/transaction-page.png)

![Emission page](/images/projects/klara/emission-page.png)

<!-- collage: new row -->

![Overview page](/images/projects/klara/overview-page.png)
