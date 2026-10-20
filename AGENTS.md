# Foley site + design system: instructions for coding agents

You are working on the Foley marketing site (foley.io, DOT compliance software) and its design
system. The stack is deliberately plain: **static HTML + CSS + vanilla JS, no framework, no
bundler for the site**. Storybook (html-vite) documents the design system. Keep it that way
unless the human asks otherwise.

Your usual job here: **build new pages and blocks from the existing components and modules**,
keep the design system in sync, and verify the result visually.

---

## 1. Start

```bash
npm install                 # once (Storybook + Vite only; the site itself has no dependencies)
npm run serve               # the site on http://127.0.0.1:4965  (keep it running)
npm run storybook           # the design system on http://127.0.0.1:4967 (keep it running)
```

Requirements: Node 22+, Python 3 (static server), Chrome or Chromium for the check tools
(`CHROME_PATH` if it is not in a standard place). Use a fresh `git init` if there is no repo yet
and commit as you go.

Pages: `/` homepage, `/modules.html` gallery of every page module, `/example-page.html` a page
built from modules, `/page-template.html` an empty page. A small **Site / DS** switch sits
bottom-left on both servers.

## 2. Where things are

| What | Where | Notes |
|---|---|---|
| Rules (this file) | `AGENTS.md` (`CLAUDE.md` points here) | |
| Full spec | `DESIGN-SYSTEM.md` | foundations, every component and module, Figma ↔ code map, known gaps |
| Catalogue | `ds/catalog.json` | machine-readable list of components + modules (keys, classes, Figma, stories). `npm run catalog` regenerates it |
| Tokens | `tokens/foley.tokens.json` (W3C DTCG) | **edit here only**, then `npm run tokens` → `tokens.css` |
| Generated CSS | `tokens.css` | never edit by hand |
| Components (homepage + shared UI) | markup `index.html`, styles `styles.css`, scripts `app.js` | How it works also needs `stages.css` + `stages.js` |
| Page modules (inner pages) | markup `modules.html`, styles `modules.css`, scripts `modules.js` | each module root has `data-module="<key>"` |
| Fonts | `assets/fonts/` (Inter Display, OFL) | declared at the top of `styles.css` |
| Images | `assets/` (`assets/modules/` for modules) | WebP, always with width/height |
| Storybook | `.storybook/`, stories in `ds/` | stories **clone markup** from `index.html` / `modules.html`, they never copy it |
| Scripts | `scripts/` | tokens, catalogue, page composer, build |
| Check tools | `tools/` | page check, Storybook check, CDP client |
| Review-only helpers | `assets/gate.js` (password screen on the public preview, off on localhost), `ds-switch.js` (Site / DS switch) | leave them alone unless asked |

## 3. Build a page (the main workflow)

1. Pick blocks: `npm run page -- --list` (or read `ds/catalog.json`, or open `/modules.html` and
   Storybook → Modules). Module families: hero screen (5 views), callout card (4), all-in block (4),
   carousel (4), tiles row (2), accordion, FAQ (3), contact form (6).
2. Compose:
   ```bash
   npm run page -- hiring.html hero-light-image allin-light-left tiles-row-image faq-horizontal-plain contact-a --title "Hiring and onboarding" --description "…"
   ```
   This writes `hiring.html` in the project root with the real header (top nav, mega menus,
   search, mobile drawer), the chosen modules in order and the real footer. Header and footer
   come from `index.html`, modules from `modules.html`.
3. Replace the placeholder copy in the new file (headings, text, button labels, links, alt text,
   images). Change **content only** in the page. Do not restyle a module inside a page.
4. Check (section 6) and look at the screenshots in `tools/out/`.

Page anatomy (the composer does this; follow it when editing by hand):

```html
<main id="main" class="pg">
  <section class="pg-sec pg-sec--flush">   <!-- hero screen: full-bleed, capped at 1440 -->
    <div class="m-hero m-hero--light-image" data-module="hero-light-image">…</div>
  </section>
  <section class="pg-sec">                 <!-- every other module: 80px rhythm, 1280 column -->
    <div class="wrap">
      <article class="m-split m-allin" data-module="allin-light-left">…</article>
    </div>
  </section>
</main>
```

- One hero per page, first. Then alternate light and dark / photo-heavy blocks; avoid two
  carousels or two forms in a row.
- Homepage components (logos, How it works, snapshot, teams, testimonials, banner…) can be used
  on inner pages too: copy the section from `index.html`. How it works needs
  `<link rel="stylesheet" href="stages.css">` and `<script src="stages.js">` before `app.js`.
- Scripts at the end of `<body>`: `app.js` (header, menus, search, drawer, reveals),
  `modules.js` (accordions, carousels, FAQ filter, forms), `ds-switch.js`. Both scripts skip
  anything that is not on the page.

## 4. Rules

**Tokens, not values.** Colours, gradients, type, spacing, layout, motion and z-index exist as
CSS custom properties: `--color-*`, `--gradient-*`, `--type-<style>` (font shorthand) +
`--type-<style>-tracking`, `--space-*`, `--layout-*`, `--motion-duration-*`,
`--motion-easing-*`, `--shadow-*`, `--z-*`. Never hard-code a value that has a token. Need a new
one? Add it to `tokens/foley.tokens.json` with `"$extensions": { "foley": { "source": "site" } }`
(anything not in Figma is a *site addition*), run `npm run tokens`, document it.

**Reuse before you create.** Check `ds/catalog.json` and `/modules.html` first. Variants are
modifier classes (`m-split--dark`, `m-split--image-right`, `m-hcar--image-right`, …), not new
components.

**A new module or a change to one** goes through the system, never into a single page:
1. markup in `modules.html` with a unique `data-module` key and a `<p class="mod-label">` caption
   (family · variant) right before it;
2. styles in `modules.css` (tokens only, mobile rules under the existing breakpoints);
3. behaviour in `modules.js` as a function bound in `init()` by a `data-*` hook; it must be
   idempotent (`init(root)` can run again on new markup) and do nothing when its markup is absent;
4. a story in `ds/modules/*.stories.js` that clones it with `mod('<key>')` from `ds/lib/site.js`
   (docs text says Figma node, sizes, tokens, states, behaviour, what is a site addition);
5. a section in `DESIGN-SYSTEM.md` (4. Modules) and a row in the Figma ↔ code table;
6. `npm run catalog`, then the checks.
New homepage-type components follow the same idea with `index.html`, `styles.css`, `app.js`,
`ds/components/`, `pick()`.

**Layout.** 1440 design canvas, 1280 content column (`.wrap`: max 1440, 80px gutters → 40 at
≤1279 → 20 at ≤959). Breakpoints (max-width): 1279, 1139, 959 (mobile), 599. Everything must
work from 360 to 2560: no horizontal scroll, nothing cut off.

**Type.** Inter Display only. Figma text styles = `--type-*` / `.type-*` (display, h1–h4,
subtitle, body-l/m/s, footnote, overline, button). Headings `text-wrap: pretty`. In copy use the
en dash `–`, not the em dash.

**Shape.** Square corners everywhere; the only radius is the input (4px) and pills. Brand mark =
12px `brand/primary` square at 8/8 in light cards.

**Motion.** Use the motion tokens. Respect `prefers-reduced-motion` (no autoplay, fades only).
`?shot` in the URL freezes animations for screenshots. Autoplay must pause on hover / focus /
off-screen (see the carousel).

**Accessibility.** Real buttons and links; visible focus ring (2px, white on dark sections);
accordions / tabs use the ARIA already in `modules.js`; every input has a label (visually hidden
is fine); images `alt=""` when decorative, real alt when they carry meaning; colour contrast AA.

**Content.** Placeholder copy is Figma placeholder copy: replace it, do not polish it. Never
invent facts, numbers, customer names, quotes or legal claims. If you must keep a placeholder,
leave an HTML comment `<!-- TODO copy -->`.

**Don't**
- edit `tokens.css`, `dist/`, `storybook-static/` or anything in `node_modules/`;
- copy component CSS into a page or add `style=""` for layout;
- add a framework, a CSS library or a build step for the site;
- push anywhere or publish without the human asking.

## 5. Figma

The source of truth is Figma + this code. Figma names are kept in code (see
`DESIGN-SYSTEM.md` → *Figma ↔ code*): `button`, `title_text`, `rect_badge`, `input`,
`callout_card`, `all_in_block`, `carousel`, `tiles_row`, `accordion`, `faq`, `contact form`,
`hero` (views). Modules come from the Figma section **modules** (node 1243:21982). The final
Figma file link is to be added by its owner. If you have Figma access, match spacing and type to
the frame; otherwise follow `DESIGN-SYSTEM.md`.

## 6. Verify before you say "done"

```bash
npm run check:page -- hiring.html     # JS errors, 404s, broken / unsized images, horizontal overflow
                                      # at 1440, 1024, 390 + full-page screenshots in tools/out/
npm run check:ds                      # if you touched the DS: every Storybook entry renders without errors
npm run build                         # optional: static dist/ (site at /, Storybook at /storybook/)
```

Then **look at the screenshots** in `tools/out/` (1440, 1024, 390). Done means: both checks
pass, nothing overlaps or is cut off at any width, copy is real or marked TODO, and any DS
change is reflected in `modules.html` / stories / `DESIGN-SYSTEM.md` / `ds/catalog.json`.

## 7. Known placeholders and gaps

- Testimonials 3–6 on the homepage (names, quotes, numbers) are invented demo content.
- FAQ answers repeat one Figma placeholder; the FAQ topic → question mapping is placeholder.
- Carousel photos for four topics come from Unsplash (Figma has one photo for all).
- Contact forms validate on the client and post nowhere; there is no backend.
- Links in the header, footer and modules are `#…` placeholders.
- Mega-menu promo images are Figma exports; the How it works product illustrations are drawn in HTML/CSS with their own small palette (`--pc-*`), not system tokens.
- The full list lives in `DESIGN-SYSTEM.md` → *Known gaps*.
