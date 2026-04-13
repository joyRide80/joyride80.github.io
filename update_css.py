import re

with open("src/styles/global.css", "r") as f:
    css = f.read()

# Replace h2 styles to include h2 + *
old_h2 = '''  .project__content :global(h2) {
    grid-column: 1 / span 1;
    font-family: var(--font-mono);
    font-size: var(--project-fluid-h2);
    font-weight: 500;
    line-height: var(--project-fluid-h2-lh);
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-top: clamp(32px, 4vw + 18px, 48px);
    margin-bottom: 12px;
  }'''

new_h2 = '''  .project__content :global(h2) {
    grid-column: 1 / span 1;
    font-family: var(--font-mono);
    font-size: var(--project-fluid-h2);
    font-weight: 500;
    line-height: var(--project-fluid-h2-lh);
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-top: clamp(32px, 4vw + 18px, 48px);
    margin-bottom: 12px;
  }
  .project__content :global(h2 + *) {
    margin-top: clamp(32px, 4vw + 18px, 48px);
  }'''
css = css.replace(old_h2, new_h2)

# Replace h3 styles to include h3 + *
old_h3 = '''  .project__content :global(h3) {
    grid-column: 1 / span 1;
    font-family: var(--font-mono);
    font-size: var(--project-fluid-h3);
    font-weight: 500;
    line-height: var(--project-fluid-h3-lh);
    letter-spacing: 0;
    text-transform: none;
    margin-top: clamp(24px, 2.5vw + 14px, 32px);
    margin-bottom: 12px;
  }'''

new_h3 = '''  .project__content :global(h3) {
    grid-column: 1 / span 1;
    font-family: var(--font-mono);
    font-size: var(--project-fluid-h3);
    font-weight: 500;
    line-height: var(--project-fluid-h3-lh);
    letter-spacing: 0;
    text-transform: none;
    margin-top: clamp(24px, 2.5vw + 14px, 32px);
    margin-bottom: 12px;
  }
  .project__content :global(h3 + *) {
    margin-top: clamp(24px, 2.5vw + 14px, 32px);
  }'''
css = css.replace(old_h3, new_h3)

# Replace p styles
old_p = '''  .project__content :global(p) {
    grid-column: 1 / span 1;
    font-family: var(--font-body);
    font-size: var(--project-fluid-body);
    line-height: var(--project-fluid-intro-lh);
    margin-bottom: 16px;
  }'''

new_p = '''  .project__content :global(p) {
    grid-column: 2 / span 2;
    font-family: var(--font-body);
    font-size: var(--project-fluid-body);
    line-height: var(--project-fluid-intro-lh);
    margin-bottom: 16px;
  }'''
css = css.replace(old_p, new_p)

# Replace blockquote
old_bq = '''  .project__content :global(blockquote) {
    grid-column: 1 / span 2;
    margin: clamp(24px, 3vw, 40px) 0;'''

new_bq = '''  .project__content :global(blockquote) {
    grid-column: 2 / span 2;
    margin: clamp(24px, 3vw, 40px) 0;'''
css = css.replace(old_bq, new_bq)

# Replace ul, ol
old_ul = '''  .project__content :global(ul),
  .project__content :global(ol) {
    grid-column: 1 / span 1;'''

new_ul = '''  .project__content :global(ul),
  .project__content :global(ol) {
    grid-column: 2 / span 2;'''
css = css.replace(old_ul, new_ul)

# Replace figure
old_fig = '''  .project__content :global(figure) {
    grid-column: 1 / span 2;'''

new_fig = '''  .project__content :global(figure) {
    grid-column: 2 / span 2;'''
css = css.replace(old_fig, new_fig)

# Replace embed
old_embed = '''  .project__content :global(.project__embed) {
    grid-column: 1 / span 2;'''

new_embed = '''  .project__content :global(.project__embed) {
    grid-column: 2 / span 2;'''
css = css.replace(old_embed, new_embed)

# Remove .text-wide, .text-pair-row etc.
# We will just comment them out or delete them.
# The block spans from `/* 2-column text wrapper: <div class="text-wide">…</div> */` to before `/* ── Images & figures ── */`

# regex to remove from text-wide to the row-break
css = re.sub(r'/\*\s*2-column text wrapper.*?\*/.*?/\* ── Images & figures ── \*/', '/* ── Images & figures ── */', css, flags=re.DOTALL)

with open("src/styles/global.css", "w") as f:
    f.write(css)

