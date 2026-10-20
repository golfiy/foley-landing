#!/usr/bin/env node
/**
 * Render every Storybook entry (stories and docs pages) and fail on render errors, JS errors
 * or empty output. Storybook dev server must be running (npm run storybook, :4967).
 *
 *   npm run check:ds              all entries
 *   npm run check:ds -- modules   only ids containing "modules"
 */
import { launch } from './cdp.mjs';

const only = process.argv[2];
const base = process.env.STORYBOOK_URL || 'http://127.0.0.1:4967';
const idx = await (await fetch(`${base}/index.json`)).json();
const entries = Object.values(idx.entries).filter((e) => !only || e.id.includes(only));
const b = await launch({ width: 1440, height: 900 });
let errs = [];
b.on((d) => {
  if (d.method === 'Runtime.exceptionThrown') errs.push((d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).split('\n')[0]);
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push('console: ' + d.params.args.map((a) => a.value || a.description).join(' ').slice(0, 200));
});
let bad = 0;
for (const e of entries) {
  errs = [];
  await b.goto(`${base}/iframe.html?id=${e.id}&viewMode=${e.type === 'docs' ? 'docs' : 'story'}`, e.type === 'docs' ? 2600 : 2000);
  const info = await b.eval(`(() => { const r = document.querySelector('#storybook-root'); const d = document.querySelector('#storybook-docs'); const el = (d && d.innerText.trim()) ? d : r; const err = document.querySelector('.sb-errordisplay'); const shown = err && document.body.classList.contains('sb-show-errordisplay'); return { h: el ? Math.round(el.getBoundingClientRect().height) : 0, err: shown ? err.innerText.slice(0, 300) : '' }; })()`);
  const fail = info.err || errs.length || info.h < 20;
  if (fail) bad++;
  console.log(`${fail ? 'FAIL' : 'ok  '} ${e.id}${info.err ? '  ERR: ' + info.err.replace(/\n/g, ' ') : ''}${errs.length ? '  JS: ' + [...new Set(errs)].join(' | ') : ''}`);
}
console.log(`\n${entries.length - bad}/${entries.length} ok`);
await b.close();
process.exit(bad ? 1 : 0);
