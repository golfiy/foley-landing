#!/usr/bin/env node
/**
 * Compose a site page from the design system: header + footer from index.html,
 * page modules from modules.html (by their data-module key).
 *
 *   npm run page -- --list
 *   npm run page -- hiring.html hero-light-image callout-light-left tiles-row+title faq-horizontal contact-a --title "Hiring and onboarding"
 *
 * <key>+title adds a section heading (title_text) above a module that has none of its own.
 * The composer also fixes the outline for a real page: the hero title becomes the page <h1>,
 * callout / all-in titles become <h2>, and the first contact form gets id="contact" (every
 * "Request a demo" / CTA link points there).
 *   npm run page -- page-template.html            (no modules: an empty page to fill by hand)
 *
 * Output goes to the project root next to index.html, so asset paths stay the same.
 * The markup is copied, not linked: edit the copy in the new page freely, but change a
 * module's structure or styles in modules.html / modules.css so every page and the DS follow.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f) => readFileSync(root + f, 'utf8');
const index = read('index.html');
const modules = read('modules.html');

/* ---------- tiny HTML helpers (our files are well-formed) ---------- */
/** Outer HTML of the element whose start tag contains `marker`, matched by tag-depth counting. */
function outer(html, marker, from = 0) {
  const at = html.indexOf(marker, from);
  if (at < 0) return null;
  const start = html.lastIndexOf('<', at);
  const tag = /^<([a-z0-9-]+)/i.exec(html.slice(start))[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'gi');
  re.lastIndex = start;
  let depth = 0;
  for (let m; (m = re.exec(html));) {
    if (m[2] === '/') continue;
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, re.lastIndex);
  }
  throw new Error(`unclosed <${tag}> at ${marker}`);
}
function indent(s, pad) {                          // re-indent a block cut from its source file
  const lines = s.split('\n');
  const last = lines.length > 1 ? lines[lines.length - 1] : '';
  const base = last.match(/^ */)[0].length;          // the closing tag sits at the opening tag's original indent
  return lines.map((l, i) => (!l.trim() ? '' : pad + (i === 0 ? l.trimStart() : l.slice(base)))).join('\n');
}

/* ---------- module catalogue from modules.html ---------- */
function listModules() {
  const out = [];
  const re = /data-module="([^"]+)"/g;
  for (let m; (m = re.exec(modules));) {
    const before = modules.slice(0, modules.lastIndexOf('<', m.index));
    const label = /<p class="mod-label[^"]*">([^<]+)<\/p>\s*$/.exec(before.slice(-600));
    out.push({ key: m[1], label: label ? label[1].trim().replace(/&amp;/g, '&') : '' });
  }
  return out;
}

/* ---------- args ---------- */
const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n/, ''));
  process.exit(0);
}
if (args.includes('--list')) {
  // with ds/catalog.json: tone and whether the module has its own heading (else use <key>+title)
  let cat = {};
  try { cat = Object.fromEntries(JSON.parse(readFileSync(root + 'ds/catalog.json', 'utf8')).modules.map((m) => [m.key, m])); } catch {}
  for (const { key, label } of listModules()) {
    const c = cat[key];
    console.log(key.padEnd(27), (c ? `${c.tone.padEnd(5)} ${c.hasTitle ? 'title  ' : 'no title'}` : '').padEnd(15), label);
  }
  console.log('\nWhat each family is for, item counts, limits: ds/catalog.json (modules[].useFor, slots).');
  process.exit(0);
}
const opt = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const title = opt('--title') || 'New page';
const description = opt('--description') || '';
const force = args.includes('--force'); if (force) args.splice(args.indexOf('--force'), 1);
const [outFile, ...keys] = args;
if (!/^[\w.-]+\.html$/.test(outFile)) throw new Error('first argument: output file name in the project root, e.g. hiring.html');
if (['index.html', 'modules.html'].includes(outFile)) throw new Error(`${outFile} is a source file, pick another name`);
if (existsSync(root + outFile) && !force) throw new Error(`${outFile} exists. Add --force to overwrite.`);
const known = new Set(listModules().map((m) => m.key));
const parsed = keys.map((k) => ({ key: k.replace(/\+title$/, ''), title: k.endsWith('+title') }));
const unknown = parsed.filter((k) => !known.has(k.key)).map((k) => k.key);
if (unknown.length) throw new Error(`unknown module(s): ${unknown.join(', ')}. Run: npm run page -- --list`);

/* ---------- head ---------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
let head = index.slice(index.indexOf('<!doctype'), index.indexOf('</head>'));
head = head
  .replace(/<title>[^<]*<\/title>/, `<title>Foley – ${esc(title)}</title>`)
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
  .replace(/\s*<link rel="preload" as="image"[^>]*>/g, '')                      // homepage hero preload
  .replace(/\s*<link rel="stylesheet" href="stages\.css">/, '')                  // How it works only
  .replace(/(<link rel="stylesheet" href="styles\.css">)/, '$1\n  <link rel="stylesheet" href="modules.css">');

/* ---------- chrome from index.html ---------- */
const bodyTop = index.slice(index.indexOf('<body>') + 6, index.indexOf('<main id="main">')).trimEnd();
const footer = outer(index, '<footer class="footer"');
const dsSwitch = outer(index, '<nav class="ds-switch"');

/* ---------- sections ---------- */
const hints = [];
let h1Done = false;
let contactDone = false;
const sections = parsed.map(({ key, title: withTitle }, i) => {
  let html = outer(modules, `data-module="${key}"`);
  if (i === 0) html = html.replace(/ loading="lazy"/g, '');                     // first block is above the fold
  // outline: one <h1> (the hero title), module titles that head a section become <h2>
  if (!h1Done && key.startsWith('hero-')) { html = html.replace(/<h2 class="m-hero-title">([\s\S]*?)<\/h2>/, '<h1 class="m-hero-title">$1</h1>'); h1Done = true; }
  else if (key.startsWith('hero-')) hints.push(`${key}: a second hero on one page; keep one hero, first`);
  if (/^(callout|allin)-/.test(key)) html = html.replace(/<h3 class="m-split-title">([\s\S]*?)<\/h3>/, '<h2 class="m-split-title">$1</h2>');
  if (/^(carousel|tiles)-/.test(key) && !withTitle) hints.push(`${key}: has no heading of its own; consider ${key}+title`);
  const id = key.startsWith('contact-') && !contactDone ? ' id="contact"' : '';
  if (id) contactDone = true;
  const flush = key.startsWith('hero-');
  const head = withTitle ? `        <div class="title-text pg-head">\n          <h2>[TODO: section title]</h2>\n          <p>[TODO: one-line intro, or delete this line]</p>\n        </div>\n` : '';
  const body = flush ? indent(html, '      ') : `      <div class="wrap">\n${head}${indent(html, '        ')}\n      </div>`;
  return `    <!-- module: ${key}${withTitle ? ' (+ section title)' : ''} -->\n    <section class="pg-sec${flush ? ' pg-sec--flush' : ''}"${id}>\n${body}\n    </section>`;
});
if (parsed.length && !h1Done) hints.push('no hero screen: add exactly one <h1> to the page');
if (parsed.length && !contactDone) hints.push('no contact form: CTA links point to #contact; give the right section id="contact" or change the links');
const main = sections.length
  ? sections.join('\n\n')
  : `    <!-- Add modules here. List them: npm run page -- --list
         Hero screens go straight in <section class="pg-sec pg-sec--flush">, every other module
         inside <section class="pg-sec"><div class="wrap"> … </div></section>. -->`;

const page = `${head}</head>
<body>
${bodyTop}

  <main id="main" class="pg">
${main}
  </main>

  ${footer}

  <!-- Site / DS switch (review tool) -->
  ${dsSwitch}

  <script src="app.js"></script>
  <script src="modules.js"></script>
  <script src="ds-switch.js"></script>
</body>
</html>
`;
writeFileSync(root + outFile, page);
console.log(`${outFile}: ${keys.length} module(s)${keys.length ? ' – ' + keys.join(', ') : ''}`);
hints.forEach((h) => console.log('  note: ' + h));
console.log(`open http://127.0.0.1:4965/${outFile}  ·  check: npm run check:page -- ${outFile}`);
