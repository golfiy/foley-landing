# Foley Design System

Version 1.0 · October 2026 · Landing prototype `foley-landing`

The tokens, components and rules behind the Foley landing page. This document is the written spec; the interactive reference is the Storybook (`npm run storybook` → http://127.0.0.1:4967). Both are built from the same files as the site.

- **Figma:** *To be added by the owner of the final Figma file.* Frames: `homepage`, `navigation`, `how_it_works hover states`
- **Site:** http://127.0.0.1:4965/
- **Source of truth:** the current Figma variables and text styles, plus the states and patterns designed on the site (marked **site** below). Everything is captured in `tokens/foley.tokens.json`.

---

## 1. How it is built

| Layer | File | Notes |
|---|---|---|
| Tokens | `tokens/foley.tokens.json` | W3C DTCG. Edit here only |
| Generated CSS | `tokens.css` | `npm run tokens`. Custom properties + `.type-*` helpers. Do not edit |
| Components | `styles.css`, `stages.css` | Site styles, written against the tokens |
| Behaviour | `app.js`, `stages.js` | Vanilla JS. Every module boots only if its markup exists |
| Markup | `index.html` | The reference markup. Stories clone from it |
| Storybook | `.storybook/`, `ds/` | Stories and docs. No copied markup or styles |

```bash
npm install
npm run tokens           # regenerate tokens.css after editing the JSON
npm run storybook        # design system on :4967
python3 -m http.server 4965 --bind 127.0.0.1   # the site
```

A *Site / DS* switch sits bottom-left on both. `?ds=<url>` points the site's switch at another Storybook host.

---

## 2. Foundations

### 2.1 Colour

Semantic tokens only, named after the Figma variables (`text/primary` → `--color-text-primary`).

**Text**

| Token | CSS | Value | Source | Use |
|---|---|---|---|---|
| `text/primary` | `--color-text-primary` | `#111117` | Figma `text/primary` | Headings, body copy, icons on light |
| `text/secondary` | `--color-text-secondary` | `#1A3946` | Figma `text/secondary` | Links, supporting copy, link-arrow labels |
| `text/tertiary` | `--color-text-tertiary` | `#70707D` | Figma `text/tertiary` | Meta text, overlines, descriptions |
| `text/light` | `--color-text-light` | `#FFFFFF` | Figma `text/light` | Text on dark and photo backgrounds |

**Background**

| Token | CSS | Value | Source | Use |
|---|---|---|---|---|
| `bg/primary` | `--color-bg-primary` | `#294C5A` | Figma `bg/primary` | Primary button, brand surfaces |
| `bg/primary-hover` | `--color-bg-primary-hover` | `#1C3843` | **site** | Primary button hover fill |
| `bg/secondary` | `--color-bg-secondary` | `#EEEEF2` | Figma `bg/secondary` | Selected / active card, hover column |
| `bg/tertiary` | `--color-bg-tertiary` | `#F8F9FC` | Figma `bg/tertiary` | Cards and list rows at rest |
| `bg/tertiary-hover` | `--color-bg-tertiary-hover` | `#F1F3FA` | **site** | Card hover (FAQ, snapshot tabs) |
| `bg/light` | `--color-bg-light` | `#FFFFFF` | Figma `bg/light` | Page, header, menus |
| `bg/light-hover` | `--color-bg-light-hover` | `#E9ECF4` | **site** | White button hover fill |
| `bg/inverse` | `--color-bg-inverse` | `#0A171C` | Figma `linear/primary end stop` | Darkest petrol, text on brand green |

**Stroke**

| Token | CSS | Value | Source | Use |
|---|---|---|---|---|
| `stroke/primary` | `--color-stroke-primary` | `#C1CFE6` | Figma `stroke/primary` | Card and column borders, rules |
| `stroke/secondary` | `--color-stroke-secondary` | `#E1EAFA` | Figma `stroke/secondary` | Hairlines in menus, lists, header |
| `stroke/light` | `--color-stroke-light` | `#FFFFFF` | Figma `stroke/light` | Outline button on dark |

**Brand**

| Token | CSS | Value | Source | Use |
|---|---|---|---|---|
| `brand/primary` | `--color-brand-primary` | `#81E014` | Figma `brand/primary` | Brand green: display word, marks. Decorative on light (contrast 1.7:1), never body text on light |

**Petrol (gradient stops)**

| Token | CSS | Value | Source | Use |
|---|---|---|---|---|
| `petrol/700` | `--color-petrol-700` | `#285A6B` | Figma `linear/secondary stop` | Gradient text start, TBD badge |
| `petrol/500` | `--color-petrol-500` | `#4A87A2` | Figma `linear/secondary stop` | Gradient text end |

**Overlay & focus**

| Token | CSS | Value | Source | Use |
|---|---|---|---|---|
| `overlay/backdrop` | `--color-overlay-backdrop` | `rgba(10, 23, 28, 0.32)` | **site** | Page dim behind search |
| `overlay/on-dark-hover` | `--color-overlay-on-dark-hover` | `rgba(255, 255, 255, 0.12)` | **site** | Hover fill for icon buttons on dark |
| `overlay/tile` | `--color-overlay-tile` | `rgba(255, 255, 255, 0.04)` | Figma `hero box_image_pattern` | Empty hero mosaic tile |

| `focus/ring` | `--color-focus-ring` | `#111117` | **site** | 2px focus outline on light (white on dark) |
| `focus/highlight` | `--color-focus-highlight` | `rgba(74, 135, 162, 0.55)` | **site** | Pulse around a search result target |

**Gradients**

| Token | Value | Source | Use |
|---|---|---|---|
| `--gradient-primary` | 180°, #1B3B48 0% → #163039 50.0% → #0A171C 100% | Figma `linear/primary` | Dark petrol sections: how it works panel, snapshot stage, testimonials |
| `--gradient-secondary` | 90°, #285A6B 0% → #4A87A2 49.721% → #4A87A2 100% | Figma `linear/secondary` | Gradient text: Insights title, Navigator AI note |
| `--gradient-tertiary` | 180°, #FFFFFF 0% → #CCD6EC 100% | Figma `linear/tertiary` | Insights band, active |
| `--gradient-tertiary-rest` | 180°, #FFFFFF 0% → #E8F0FF 100% | **site** | Insights band, rest |
| `--gradient-light` | 180°, #F4F7FE 0% → #E1E9FB 100% | Figma `linear/light (approximated from render)` | Mega menu promo card |
| `--gradient-scrim` | 90°, rgba(0, 0, 0, 0.88) 19.84% → rgba(0, 0, 0, 0.74) 38.374% → rgba(0, 0, 0, 0) 63.854% | Figma `banner overlay` | Banner photo scrim |

**Shadows**

| Token | Value | Use |
|---|---|---|
| `--shadow-overlay` | `0 30px 60px -20px rgba(10, 23, 28, 0.28)` | Mega menu, search panel |
| `--shadow-header` | `0 1px 0 #E1EAFA, 0 10px 30px rgba(10, 23, 28, 0.06)` | Sticky main bar |

**Rules**
- Content text on light: `text/primary`. Links and supporting copy: `text/secondary`. Meta: `text/tertiary`.
- `brand/primary` is decorative on light (1.7:1). Use it for marks and the hero word on dark, never for text on light.
- Dark sections always use `--gradient-primary`, never a flat fill.
- `stroke/primary` frames cards and columns. `stroke/secondary` is for hairlines inside menus and lists.
- Hover moves one step on the same ramp. It never introduces a new hue.

### 2.2 Typography

Inter Display everywhere. Fallback: Inter (Google Fonts) with `font-variation-settings: "opsz" 32`, which is the same drawing. Product illustrations use Inter at opsz 14.

| Style (Figma) | Token / class | Weight | Size / line | Tracking | Use |
|---|---|---|---|---|---|
| `header/display` | `--type-display` · `.type-display` | 400 | 116px / 120px | -3.48px | Hero word (-3%) |
| `header/h1` | `--type-h1` · `.type-h1` | 400 | 60px / 64px | -1.2px | Hero headline (-2%) |
| `header/h2` | `--type-h2` · `.type-h2` | 500 | 44px / 1.1 | -0.5px | Section titles |
| `header/h3` | `--type-h3` · `.type-h3` | 500 | 32px / 1.1 | -0.5px | Card titles, stage titles |
| `header/h4` | `--type-h4` · `.type-h4` | 500 | 24px / 1.1 | -1px | List and tab titles |
| `subtitle/subtitle` | `--type-subtitle` · `.type-subtitle` | 400 | 24px / 1.2 | -0.5px | Section subtitles, quotes |
| `subtitle/subtitle_medium` | `--type-subtitle-medium` · `.type-subtitle-medium` | 500 | 24px / 1.2 | -0.5px | Navigator AI note |
| `body/body_l` | `--type-body-l` · `.type-body-l` | 400 | 20px / 1.2 | 0 | Hero lead, FAQ copy |
| `body/body_l_medium` | `--type-body-l-medium` · `.type-body-l-medium` | 500 | 20px / 1.2 | -0.5px | Stage links, logo row title |
| `body/body_m` | `--type-body-m` · `.type-body-m` | 400 | 18px / 1.2 | -0.09px | Card copy (-0.5%) |
| `body/body_m_medium` | `--type-body-m-medium` · `.type-body-m-medium` | 500 | 18px / 1.2 | -0.5px | Mega menu column titles, stage subtitles |
| `body/body_s` | `--type-body-s` · `.type-body-s` | 400 | 16px / 1.2 | 0 | Snapshot copy |
| `body/body_s_medium` | `--type-body-s-medium` · `.type-body-s-medium` | 500 | 16px / 24px | 0 | Nav items, info bar |
| `footnote/footnote` | `--type-footnote` · `.type-footnote` | 400 | 14px / 1.2 | 0 | Legal, descriptions |
| `footnote/footnote_medium` | `--type-footnote-medium` · `.type-footnote-medium` | 500 | 14px / 1.2 | 0 | Menu and footer links |
| `overline` | `--type-overline` · `.type-overline` | 500 | 16px / 1.2 | 0.32px | Eyebrows, uppercase (+2%) |
| `button` | `--type-button` · `.type-button` | 600 | 18px / 20px | -0.5px | Buttons and text links |

- Percent letter-spacing from Figma is converted to px (display −3%, h1 −2%, body_m −0.5%, overline +2%).
- Paragraphs: `text-wrap-style: pretty`.
- Uppercase only for `overline`. Copy never uses the em dash (U+2014); use the en dash (–).

### 2.3 Layout

| Token | Value | Note |
|---|---|---|
| `--layout-canvas` | `1440px` | Design width |
| `--layout-content` | `1280px` | Content width inside 80px gutters |
| `--layout-gutter-lg` | `80px` | ≥ 1280 |
| `--layout-gutter-md` | `40px` | 960–1279 |
| `--layout-gutter-sm` | `20px` | < 960 |
| `--layout-section-y` | `140px` | Vertical section padding |
| `--layout-header-info` | `33px` | Info bar |
| `--layout-header-main` | `76px` | Main bar (64px < 960) |

**Breakpoints** (max-width): `1279px` gutters 40 · `1139px` Log in leaves the header · `959px` mobile layout (drawer, stacked blocks, gutters 20).

**Wide screens** (site addition): nothing scales above 1440. The hero stops at the 1440 canvas (`--layout-canvas`) and centres; testimonials and banner are dark cards in the 1280 column (from 960px up, full-bleed on mobile). Every section aligns to the same column edge.

**Rhythm:** section padding 140 (96 mobile) · title block → content 48 (32) · content → CTA 48 (32) · title → subtitle 24 · card padding 32 / 24.

**Radius:** none. Only icon chips and pills are round.

**Spacing scale**

| Token | Value | Note |
|---|---|---|
| `--space-1` | `4px` |  |
| `--space-2` | `8px` |  |
| `--space-3` | `12px` |  |
| `--space-4` | `16px` |  |
| `--space-5` | `20px` |  |
| `--space-6` | `24px` |  |
| `--space-8` | `32px` |  |
| `--space-10` | `40px` |  |
| `--space-12` | `48px` |  |
| `--space-16` | `64px` |  |
| `--space-20` | `80px` |  |
| `--space-35` | `140px` |  |

**Layers**

| Token | Value | Note |
|---|---|---|
| `--z-drawer` | `55` |  |
| `--z-backdrop` | `58` |  |
| `--z-header` | `60` |  |
| `--z-demo` | `90` |  |
| `--z-skip` | `100` |  |

### 2.4 Iconography

24px on a 24px grid, 1.6px stroke, round caps and joins (Figma `ico/*`). Colours are baked per use: ink on light, white on dark, `text/secondary` for link arrows. Buttons and links always use `ico/arrow/right` at 24px; mega-menu column heads use it at 20px. Exception: `ico/ai` (32px, Figma 1227:27470) is the multi-colour AI mark (star filled with blurred colour fields), used only in the Insights badge. Files: `assets/v2/ico`, `assets/v2/social`.

### 2.5 Motion

Things **enter** with `ease-out` and **leave** with `ease-in`, faster. Colour and opacity use `standard`. All durations are multiplied by `--slow` (review mode `?slow=N`).

**Durations**

| Token | Value | Use |
|---|---|---|
| `--motion-duration-out` | `140ms` | Content leaving on hover-out |
| `--motion-duration-return` | `90ms` | Lead before default content returns |
| `--motion-duration-fade` | `300ms` | Opacity in |
| `--motion-duration-bg` | `320ms` | Background colour change |
| `--motion-duration-move` | `520ms` | Position in |
| `--motion-duration-stagger` | `40ms` | Between list items |
| `--motion-duration-lead` | `70ms` | Before the first staggered item |
| `--motion-duration-reveal` | `900ms` | Scroll reveal opacity |
| `--motion-duration-reveal-move` | `1000ms` | Scroll reveal translate |
| `--motion-duration-split` | `1100ms` | Heading word mask |
| `--motion-duration-menu-open` | `620ms` | Mega menu / search curtain in |
| `--motion-duration-menu-close` | `380ms` | Curtain out |
| `--motion-duration-scene` | `6000ms` | Hero scene and snapshot autoplay |
| `--motion-easing-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default for anything entering |
| `--motion-easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Anything leaving |
| `--motion-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Colour and opacity |
| `--motion-easing-odometer` | `cubic-bezier(0.76, 0, 0.24, 1)` | Hero word roll |

| Pattern | Where | Spec |
|---|---|---|
| Scroll reveal | `[data-reveal]` | opacity 900ms + 26px rise 1000ms, ease-out, once |
| Heading split | `[data-split]` | words rise out of a mask, 50ms per word, 1100ms |
| Curtain | how-it-works panel, mega menu, search | `clip-path` inset opens |
| Hover swap | how-it-works columns | out 140ms, links in with 40ms stagger after 70ms; return after 90ms |
| Morph | stage CTA | text link → white button (padding + plate scale 0.6 → 1) |
| Fill wipe | buttons, category rows | `::before` scales from the left, 500 / 700ms |
| Odometer | hero word | per-letter roll, 42ms stagger |
| Tile wave | hero mosaic | per-tile clip-path + scale + brightness, diagonal 55ms delay |
| Parallax | hero layers, photos | bg 90px, grid 70px, copy −54px over the hero height |

Autoplay (hero scenes, snapshot tabs): 6s per item, only while visible, paused on hover, focus and hidden tabs.
Reduced motion: no intro, parallax, marquee or autoplay; state changes are instant; hero scenes change on click with a fade.

### 2.6 Imagery

- Subjects: the vehicles and people Foley customers manage (trucks, ambulances, construction and farm machinery, school buses, fleet managers at real screens). Natural light, natural colour.
- No watermarked stock. Hire / Monitor hero scenes use Unsplash / Pexels free-licence photos (credits in README).
- **Hero mosaic:** 6×4 tiles, 156px on a 157px pitch; blocks A (top, 3×2), T (right, 3×2), C (bottom, 3×2 minus top-right); empty tiles `--color-overlay-tile`. A scene is one 1882×1254 transparent WebP built by `ref/tools/build_scenes.py`.
- Banner photos keep their proportions and fade into the scrim; never stretch.

---

## 3. Components

Each entry: Figma name → class, anatomy, variants, states, behaviour. Every component has a Storybook page with the same name.

### Button · `button`
`.btn` + variant. Label `type/button`; optional 24px arrow `.btn-ico`. Padding 14/16/14/24 with icon, 16/24 without (`.btn-plain`), 12/24 compact (`.btn-head`). Square.

| Variant | Class | Rest | Hover |
|---|---|---|---|
| Primary | `.btn-teal` | `bg/primary`, `text/light` | fill `bg/primary-hover` wipes in |
| White | `.btn-white` | `bg/light`, `text/primary` | `bg/light-hover` |
| Outline | `.btn-outline` | 1px inner `stroke/light`, `text/light` | fills white, text and arrow invert |
| Text | `.btn-text` | `text/secondary` | underline grows, colour to `text/primary` |

States: hover (fill wipe 500ms, arrow +4px) · focus (2px ring, offset 3px) · active (1px down). White and Outline are for dark or photo backgrounds only.

### Link
- `.link-arrow` (`type/button`, `text/secondary`, 24px arrow): arrow +4px on hover. `.link-arrow-lg` adds 12px vertical padding.
- `.nav-trigger` / `.nav-link` (`type/body-s-medium`): 1px underline grows from the left; triggers rotate the 16px chevron while open.
- `.mm-links a` (`type/footnote-medium`): underline, `text/secondary`, 2px nudge.
- `.mm-head` (column head): title + description are one link; on hover / focus the title turns `text/secondary` with an underline and a 20px arrow slides in from −8px (absolutely positioned, never reflows the title).

### Badge & mark
`.mark` 12×12 `brand/primary` at 8/8 inside cards and columns (static). `.overline` `type/overline` in `text/tertiary`. `.badge` pill with `--gradient-secondary` (TBD). `kbd` for keyboard hints.

### Title text · `title_text`
628px block: `type/h2` + 24px + `type/subtitle` (max 424px). Light variant on dark sections.

### Top navigation · `top navigation`
- Info bar (33px): Search trigger (+ `/` hint on hover) and phone, `type/body-s-medium`, `text/tertiary`. Scrolls away.
- Main bar (76px): logo · nav (40px gaps) · Log in · Request a demo. Sticky; `--shadow-header` after 33px of scroll.
- ≤1139: Log in hidden. ≤959: nav and info bar hidden; search icon + burger.

### Mega menu · `navigation`
1280×470 stage under the main bar, `bg/light`, `--shadow-overlay`. Columns (32px padding, `stroke/secondary` dividers): column head (link) → links (16px gap). Promo card 282px (`--gradient-light`, 196px photo, overline, 20px title). Footer row of `.link-arrow-lg`.

| Menu | Columns | Footer |
|---|---|---|
| Products | Hiring and Onboarding · Compliance · Data Monitoring · Background Checks | The Foley Platform · Foley Navigator AI |
| Solutions | By Role · By Initiative · By Industry | Solutions home |
| Resources | Library · Compliance Guides | View all resources |
| Company | Why Foley · About | About Foley |

Behaviour: hover intent 120ms (60ms between triggers) · click toggles · ↓ opens and focuses the first link · Esc / outside click / scroll > 60px closes · closed panels are `inert`. Motion: curtain 620ms in / 380ms out, columns cascade (+40ms), promo wipes; switching slides 28px toward the new trigger, the old panel clears in 110ms first.

### Search
Trigger in the info bar (or `/`, ⌘K / Ctrl+K; icon on mobile). Panel under the main bar, same curtain as the menus; page dimmed with `overlay/backdrop`.
- Input row (80px): 24px icon, 24px input (`type/subtitle-medium`), Clear, Esc.
- Empty: *Popular searches* chips (`bg/tertiary`, 1px `stroke/secondary`) + *Suggested* list.
- Results: groups (Products, Solutions, Resources, Company, Customer stories, On this page) with counts; row = title with the match underlined in `text/secondary` + breadcrumb in `text/tertiary`; active row `bg/secondary` with “Open ↵”.
- Typo fallback: one edit (two for words ≥ 7 letters), “Showing results for …”.
- No results: title, hint, “Ask a compliance expert”.
- Keyboard: combobox (`aria-activedescendant`), ↑/↓, Enter, Esc returns focus. Live count in the footer.
- Choosing a result scrolls to the closest place on the page and opens it (stage column, testimonial, team row) with a short `focus/highlight` pulse.
- Mobile: full screen under the bar, “Cancel” instead of Esc, no footer hints.

### Mobile drawer
≤959. Burger (two lines → X). Full-screen under the bar, locks page scroll. `<details>` sections (`type/body-l-medium` summaries, rotating chevron) → Pricing → Log in + Request a demo.

### Hero · `hero`
See 2.6 for the mosaic. Left layout 656px (64/80 padding, centred, 32px gaps): display word (`type/display`, `brand/primary`) → `type/h1` → `type/body-l` lead (≤ 496px) → White + Outline buttons. Scenes Onboard → Monitor → Hire every 6s: odometer word + tile wave. Pointer parallax and scroll drift. Scales with `zoom` from 960 to 1440; stacks below 960.

### Partner logos · `partner_logos`
Title `type/body-l-medium`; mono logos 48px high, 64px gap, 48px edge fades. Marquee (42s loop), counter 0 → 50,000 on entry. No hover.

### How it works · `four_row_card` + insights
`--gradient-primary` panel (40px). Column 400×496 with `stroke/primary` border: mark, `type/h3`, `type/body-m-medium` subtitle (`text/tertiary`), stage CTA, illustration.
Active (hover / focus / tap): `bg/secondary`; CTA morphs into a white button; illustration out, four links (`type/body-l-medium` + arrow) in with 40ms stagger in the 299px bottom cell.
Insights band: connectors, AI badge (rotates 90° when active), `--gradient-secondary` title, links + Get insights; background `--gradient-tertiary-rest` → `--gradient-tertiary`.
First view: curtain + one automatic pass through the hover states, cancelled by any interaction. ≤959: stacked, Insights always open.

### Snapshot tabs · `silent_card`
433px vertical tablist + `--gradient-primary` stage (64px) with one screenshot. Tab: `type/h4` (one line) + `type/body-m`; rest `bg/tertiary` / hover `bg/tertiary-hover` / selected `bg/secondary`. Each tab pans and zooms the screenshot (1100ms ease-out). Autoplay 6s.

### Category row · `multiple_card`
24px icon, `type/h4`, `type/body-m` in `text/secondary`, 24px arrow; 32/24 padding, min-height 172. Hover / focus: `bg/secondary` wipes in from the left (700ms), copy to `text/primary`, arrow +6px; icon stays.

### Cards
- **Text card** `text_card` (`.trio-card`): overline, `type/h4`, `type/body-m` tertiary; right border `stroke/secondary`; no hover.
- **FAQ card** `faq_card` (`.faq-card`): `type/h3` in a 70px box, `type/body-l` `text/secondary`, arrow link at the bottom; hover `bg/tertiary-hover`.
- **Testimonial card** `testimonial_card` (`.case`): 84px logo row + overline, `type/h3` bottom-aligned in 70px, `stroke/primary` rule, `type/subtitle` quote, author `body-m` tertiary, Read case study.

### Testimonials · `testimonials`
`--gradient-primary` card in the 1280 column (padding 80/40), two cards visible (482px, 20px gap, quote clamped to 2 lines), round arrows outside (hover `overlay/on-dark-hover`, disabled 30%). Steps one card (800ms), drag / swipe (60px), ←/→. One card per view ≤959.

### Banner · `banner`
688px dark card in the 1280 column (copy 40px from its edge), photo fills it as in Figma + `--gradient-scrim`, light `title_text` (521px, subtitle 396px), White plain + Outline (52px).

### Footer · `footer`
Top row (3 short columns + CTAs), four stacks of link groups (197px, `type/footnote-medium`, headings `text/tertiary`), brand block (logo, address, phone), UCR disclaimer (`type/footnote`, `text/tertiary`, link `text/secondary` underlined) bottom-aligned with the BBB + PBSA badges from the third column (Figma 1221:27198), `stroke/primary` rule, legal row and social icons (24px, 40px gaps).

---

## 4. Accessibility

- Focus ring on every interactive element (2px, `focus/ring`; white on dark).
- Keyboard: see each component. Menus are disclosure panels with `aria-expanded` and `inert` when closed; search is a dialog + combobox; snapshot is a vertical tablist.
- Contrast: `text/primary` and `text/secondary` pass AAA on all light backgrounds; `text/tertiary` passes AA (4.5:1+) on white and `bg/tertiary`; `brand/primary` is decorative only on light.
- `prefers-reduced-motion` is honoured everywhere (2.5).
- Decorative images `alt=""`; the animated hero word is `aria-hidden`, the full headline stays in an `sr-only` copy.

---

## 5. Figma ↔ code

| Figma | Code |
|---|---|
| `top navigation` / `info-banner` / `header` | `.topnav`, `.infobar`, `.mainbar` |
| `navigation` (Navigation Content) | `.megamenu`, `.mm-panel`, `.mm-col`, `.mm-head`, `.mm-promo`, `.mm-foot` |
| `hero` / `box_image_pattern` / `left layout` | `.hero`, `.hero-grid`, `.hero-copy` |
| `partner_logos` / `partners_logo` | `.logos`, `.marquee` |
| `title_text` | `.title-text` |
| `four_row_card` | `.stage` |
| `silent_card` | `.snap-item` |
| `multiple_card` | `.team-row` |
| `text_card` | `.trio-card` |
| `testimonial_card` | `.case` |
| `faq_card` | `.faq-card` |
| `banner` | `.band` |
| `footer` | `.footer` |
| `button` | `.btn` (+ variant) |
| `rect_badge` | `.mark` |
| `ico/*` | `assets/v2/ico/*.svg` |

---

## 6. Working with the system

- **Change a value:** edit `tokens/foley.tokens.json` → `npm run tokens` → check the site and Storybook. Keep Figma variable names in sync.
- **Add a component:** markup in `index.html`, styles in `styles.css` using tokens only, behaviour in `app.js` as a module that does nothing when its markup is absent. Add a story that clones the markup with `pick()` and, if it has behaviour, a **Live** story.
- **Never** hard-code a colour, size or duration that already has a token.
- **Review modes on the site:** `.` demo panel · `?shot` static frame · `?slow=N` · `?menu=products` · `?search=mvr` · `?shot=all` (all column hover states).

---

## 7. Known gaps

- Figma has no drawings for hover / focus states, search, mobile drawer or motion; those come from the site and are part of v1 of this system.
- `linear/light` (promo card) is approximated from the Figma render: the variable value was not exposed.
- Testimonials 3–6 and their numbers are demo content.
- Snapshot uses one screenshot with three focus points; replace with three screenshots when available.
- Product illustrations inside the how-it-works columns use their own small palette (`--pc-*`), not the system tokens.

## Changelog

- **1.0** (2026-10): tokens extracted from Figma + site into DTCG JSON; Storybook with foundations, 17 component pages, live stories and the homepage; mega-menu column heads became links.
