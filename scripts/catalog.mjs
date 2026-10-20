#!/usr/bin/env node
/**
 * Build ds/catalog.json: a machine-readable index of everything a page can be built from.
 * Modules are read from modules.html (data-module keys), so the catalogue never drifts from
 * the markup; components are listed here by hand with their selector in index.html.
 *
 *   npm run catalog
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f) => readFileSync(root + f, 'utf8');
const modulesHtml = read('modules.html');
const tokens = JSON.parse(read('tokens/foley.tokens.json'));
const pkg = JSON.parse(read('package.json'));

const sb = (id) => ({ docs: `/?path=/docs/${id}--overview`, id });

/* ---------- components (homepage and shared UI; markup in index.html) ---------- */
const components = [
  { name: 'Button', figma: 'button', selector: '.btn', variants: ['.btn-teal (Primary)', '.btn-white (White, dark / photo bg)', '.btn-outline (Outline, dark bg)', '.btn-text (Text)', '.btn-plain / .btn-head (sizes)'], css: 'styles.css', story: sb('components-button'), notes: 'Label type/button; optional 24px arrow img.btn-ico (arrow-white.svg on teal, arrow-ink.svg on white).' },
  { name: 'Text link with arrow', figma: 'button (text)', selector: '.link-arrow', css: 'styles.css', story: sb('components-link'), notes: 'img arrow-link.svg 24px; .link-arrow-lg in mega menus.' },
  { name: 'Input', figma: 'input', selector: '.m-field > .m-input', css: 'modules.css', js: 'modules.js ([data-form] validation)', story: sb('components-input'), notes: 'Always inside label.m-field with a visually hidden span.sr-only label.' },
  { name: 'Mark and overline', figma: 'rect_badge', selector: '.mark, .overline', css: 'styles.css', story: sb('components-badge-mark') },
  { name: 'Title text', figma: 'title_text', selector: '.title-text', css: 'styles.css', story: sb('components-title-text'), notes: 'h2 + p (type/h2 + type/subtitle, 424 max).' },
  { name: 'Top navigation (header)', figma: 'top navigation', selector: 'header.topnav', css: 'styles.css', js: 'app.js', story: sb('components-top-navigation'), notes: 'Copied into every page by scripts/compose-page.mjs.' },
  { name: 'Mega menu', figma: 'navigation', selector: '.megamenu', css: 'styles.css', js: 'app.js', story: sb('components-mega-menu') },
  { name: 'Search', figma: '(site addition)', selector: '.searchpanel', css: 'styles.css', js: 'app.js', story: sb('components-search') },
  { name: 'Mobile drawer', figma: '(site addition)', selector: '#drawer', css: 'styles.css', js: 'app.js', story: sb('components-mobile-drawer') },
  { name: 'Homepage hero', figma: 'hero (view=main)', selector: 'section.hero', css: 'styles.css', js: 'app.js (scene mosaic)', story: sb('components-hero'), notes: 'Homepage only. Inner pages use the Hero screen module.' },
  { name: 'Partner logos', figma: 'partner_logos', selector: 'section.logos', css: 'styles.css', js: 'app.js', story: sb('components-partner-logos') },
  { name: 'How it works', figma: 'four_row_card + insights', selector: '.stages-panel', css: 'stages.css', js: 'stages.js', story: sb('components-how-it-works'), notes: 'Needs stages.css + stages.js on the page.' },
  { name: 'Snapshot tabs', figma: 'silent_card', selector: '.snap', css: 'styles.css', js: 'app.js', story: sb('components-snapshot-tabs') },
  { name: 'Category row (teams)', figma: 'multiple_card', selector: '.team-row', css: 'styles.css', story: sb('components-category-row') },
  { name: 'Cards', figma: 'text_card, faq_card, testimonial_card', selector: '.trio-card, .faq-card, .case', css: 'styles.css', story: sb('components-cards') },
  { name: 'Testimonials', figma: 'testimonials', selector: 'section.cases', css: 'styles.css', js: 'app.js (carousel)', story: sb('components-testimonials') },
  { name: 'Banner', figma: 'banner', selector: 'section.band', css: 'styles.css', story: sb('components-banner') },
  { name: 'Footer', figma: 'footer', selector: 'footer.footer', css: 'styles.css', story: sb('components-footer'), notes: 'Copied into every page by scripts/compose-page.mjs.' },
];

/* ---------- modules (inner pages; markup in modules.html) ---------- */
const families = [
  { prefix: 'hero-', name: 'Hero screen', figma: 'hero (1243:14730)', story: 'modules-hero-screen', hasTitle: true, placement: 'full-bleed, first on the page: <section class="pg-sec pg-sec--flush">',
    useFor: 'Top of an inner page: page title (becomes the h1, ≤ 4 lines at 60px), one-sentence promise, one CTA. light bg = product UI shot; light / dark image = photo-led pages (industries); dark boxed / dark pattern = no photo available.' },
  { prefix: 'callout-', name: 'Callout card', figma: 'callout_card (1243:14783)', story: 'modules-callout-card', hasTitle: true,
    useFor: 'One idea with a photo: a feature, an industry, a story. Title (≤ 4 lines) + 1–2 short paragraphs + one CTA. Alternate image left / right when two follow each other.' },
  { prefix: 'allin-', name: 'All-in block', figma: 'all_in_block (1243:14828)', story: 'modules-all-in-block', hasTitle: true,
    useFor: 'What is included / key benefits: title, one paragraph, 3–4 check items (each ≤ 2 lines), one CTA.' },
  { prefix: 'carousel-', name: 'Carousel', figma: 'carousel (1243:14902)', story: 'modules-carousel', hasTitle: false, behaviour: 'autoplay with progress line, photo per topic, pause on hover / focus / off-screen',
    useFor: '3–5 parallel options or steps sharing one layout (services, test types, program steps). Each topic: title (horizontal tabs: ≤ 22 characters so it stays on one line at 1024), 1–2 paragraphs, CTA, its own photo. Add +title for a section heading.' },
  { prefix: 'tiles-', name: 'Tiles row', figma: 'tiles_row (1243:14816)', story: 'modules-tiles-row', hasTitle: false,
    useFor: 'Exactly four short parallel points or resources (reasons to choose, guides, articles). Title ≤ 2 lines, text ≤ 7 lines, a text link. Add +title for a section heading.' },
  { prefix: 'accordion', name: 'Accordion', figma: 'accordion (1243:14965)', story: 'modules-accordion', hasTitle: true, behaviour: 'one item open',
    useFor: 'One topic split into 4–6 sub-topics next to one photo; short answers (≤ 6 lines).' },
  { prefix: 'faq-', name: 'FAQ', figma: 'faq (1243:14977)', story: 'modules-faq', hasTitle: true, behaviour: 'one item open; topic menu filters (horizontal)',
    useFor: 'Questions and answers near the end of a page. horizontal: 6–8 questions, optional topic menu (needs data-topics on items); horizontal-plain: no menu; vertical: long or rich answers (lists).' },
  { prefix: 'contact-', name: 'Contact form', figma: 'contact form (1243:14624)', story: 'modules-contact-form', hasTitle: true, behaviour: 'client-side validation, posts nowhere',
    useFor: 'End-of-page conversion (demo request): A with photo, B dark frame + photo, C compact card, D C in a dark frame. E with card title = gated download (guide). The composer gives the first one id="contact".' },
  { prefix: 'input-states', name: 'Input states (DS demo)', figma: 'input', story: 'components-input', hasTitle: false, placement: 'design-system demo only, not for pages', useFor: 'Design-system demo of input states. Not for pages.' },
];

function outerStartTag(html, at) {
  const start = html.lastIndexOf('<', at);
  return html.slice(start, html.indexOf('>', at) + 1);
}
/** outer HTML of the element starting before index `at` (tag-depth match) */
function outerBlock(html, at) {
  const start = html.lastIndexOf('<', at);
  const tag = /^<([a-z0-9-]+)/i.exec(html.slice(start))[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'gi');
  re.lastIndex = start;
  let depth = 0;
  for (let m; (m = re.exec(html));) { if (m[2] === '/') continue; depth += m[1] ? -1 : 1; if (depth === 0) return html.slice(start, re.lastIndex); }
  return '';
}
const modules = [];
for (const m of modulesHtml.matchAll(/data-module="([^"]+)"/g)) {
  const key = m[1];
  const fam = families.find((f) => key.startsWith(f.prefix));
  const tag = outerStartTag(modulesHtml, m.index);
  const cls = (/class="([^"]+)"/.exec(tag) || [])[1] || '';
  const before = modulesHtml.slice(0, modulesHtml.lastIndexOf('<', m.index));
  const label = (/<p class="mod-label[^"]*">([^<]+)<\/p>\s*$/.exec(before.slice(-600)) || [])[1] || '';
  const block = outerBlock(modulesHtml, m.index);
  const count = (re) => (block.match(re) || []).length;
  const slots = Object.fromEntries(Object.entries({
    checks: count(/<li><span class="m-check"/g), topics: count(/class="m-vcar-item|class="m-hcar-tab[ "]/g),
    tiles: count(/<article class="m-tile/g), items: count(/class="m-acc-item/g), fields: count(/class="m-input"/g),
    topicMenu: count(/class="m-faq-topic"/g),
  }).filter(([, v]) => v));
  const dark = /m-hero--dark|m-split--dark/.test(cls) || /m-form--b/.test(cls) || /m-form-frame/.test(cls);
  modules.push({
    key,
    family: fam ? fam.name : '',
    variant: label.replace(/&amp;/g, '&').replace(/^[^·]*·\s*/, '').trim(),
    classes: cls,
    figma: fam ? fam.figma : '',
    tone: dark ? 'dark' : 'light',
    hasTitle: fam ? fam.hasTitle : false,
    slots,
    useFor: fam ? fam.useFor : '',
    behaviour: (fam && fam.behaviour) || 'static',
    placement: fam && fam.placement ? fam.placement : 'inside <section class="pg-sec"><div class="wrap">',
    story: fam ? sb(fam.story) : null,
  });
}

/* ---------- tokens summary ---------- */
const flat = (node, path = []) => Object.entries(node).flatMap(([k, v]) => (k.startsWith('$') ? [] : v && typeof v === 'object' && '$value' in v ? [[[...path, k].join('-'), v]] : flat(v, [...path, k])));
const tokenGroups = {};
for (const [name] of flat(tokens)) { const g = name.split('-')[0]; tokenGroups[g] = (tokenGroups[g] || 0) + 1; }

const catalog = {
  name: 'Foley design system',
  version: pkg.version || '1.3.0',
  generated: 'npm run catalog (scripts/catalog.mjs). Do not edit by hand.',
  howTo: {
    newPage: 'npm run page -- <file>.html <module-key> [<module-key> …] --title "Page title"',
    listModules: 'npm run page -- --list',
    checkPage: 'npm run check:page -- <file>.html',
    checkDs: 'npm run check:ds',
    rules: 'AGENTS.md',
    spec: 'DESIGN-SYSTEM.md',
  },
  sources: {
    tokens: 'tokens/foley.tokens.json → npm run tokens → tokens.css (CSS custom properties --<group>-<name>, .type-* helpers)',
    componentsMarkup: 'index.html',
    modulesMarkup: 'modules.html',
    styles: ['tokens.css', 'styles.css', 'modules.css', 'stages.css (How it works only)'],
    scripts: ['app.js (header, menus, search, drawer, homepage blocks, reveals)', 'modules.js (accordions, carousels, FAQ filter, forms)', 'stages.js (How it works only)'],
    storybook: 'npm run storybook → http://127.0.0.1:4967',
  },
  tokens: tokenGroups,
  breakpoints: { lg: 'max-width 1279px', md: 'max-width 1139px', sm: 'max-width 959px (mobile)', xs: 'max-width 599px' },
  components,
  modules,
};
writeFileSync(root + 'ds/catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log(`ds/catalog.json: ${components.length} components, ${modules.length} modules`);
