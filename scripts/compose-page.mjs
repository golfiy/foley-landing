#!/usr/bin/env node
/**
 * Compose a site page from the design system: header + footer from index.html,
 * page modules from modules.html (by their data-module key).
 *
 *   npm run page -- --list
 *   npm run page -- hiring.html hero-light-image callout-light-left tiles-row faq-horizontal contact-a --title "Hiring and onboarding"
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
const indent = (s, pad) => s.split('\n').map((l) => (l.trim() ? pad + l.replace(/^ {0,8}/, '') : l)).join('\n');

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
  for (const { key, label } of listModules()) console.log(key.padEnd(28), label);
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
const unknown = keys.filter((k) => !known.has(k));
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
const sections = keys.map((key, i) => {
  let html = outer(modules, `data-module="${key}"`);
  if (i === 0) html = html.replace(/ loading="lazy"/g, '');                     // first block is above the fold
  const flush = key.startsWith('hero-');
  const body = flush ? indent(html, '      ') : `      <div class="wrap">\n${indent(html, '        ')}\n      </div>`;
  return `    <!-- module: ${key} -->\n    <section class="pg-sec${flush ? ' pg-sec--flush' : ''}">\n${body}\n    </section>`;
});
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
console.log(`open http://127.0.0.1:4965/${outFile}  ·  check: npm run check:page -- ${outFile}`);
