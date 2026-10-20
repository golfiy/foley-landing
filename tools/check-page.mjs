#!/usr/bin/env node
/**
 * Check a page the way a reviewer would: loads it at 1440, 1024 and 390 wide, reports
 * JS errors, failed requests, horizontal overflow and images without size, and saves
 * full-page screenshots to tools/out/<page>-<width>.png (pages up to 16000px tall).
 *
 *   npm run check:page -- hiring.html            (site server on :4965 must be running)
 *   npm run check:page -- http://127.0.0.1:4965/modules.html 1440
 *
 * Exit code 1 when something is wrong, so agents can use it as a gate.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const [target = 'index.html', ...w] = process.argv.slice(2);
const url = /^https?:/.test(target) ? target : `http://127.0.0.1:4965/${target.replace(/^\//, '')}`;
const widths = w.length ? w.map(Number) : [1440, 1024, 390];
const OUT = fileURLToPath(new URL('./out/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const name = url.split('/').pop().replace(/\.html.*$/, '') || 'index';

let failed = false;
for (const width of widths) {
  const b = await launch({ width, height: 900 });
  const problems = [];
  b.on((d) => {
    if (d.method === 'Runtime.exceptionThrown') problems.push('JS: ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).split('\n')[0]);
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') problems.push('console.error: ' + d.params.args.map((a) => a.value || a.description).join(' ').slice(0, 200));
    if (d.method === 'Network.responseReceived' && d.params.response.status >= 400) problems.push(`HTTP ${d.params.response.status}: ${d.params.response.url}`);
    if (d.method === 'Network.loadingFailed' && !d.params.canceled) problems.push(`request failed: ${d.params.errorText}`);
  });
  await b.send('Network.enable');
  await b.goto(url, 1500);
  // load lazy images, then measure
  await b.eval(`(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }); return Promise.race([Promise.all([...document.images].map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 8000))]).then(() => 1); })()`);
  await b.sleep(300);
  const info = await b.eval(`(() => {
    const W = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')].filter((e) => {
      const r = e.getBoundingClientRect(); if (r.width === 0 || r.right <= W + 1) return false;
      for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) return false; }
      return true;
    }).slice(0, 5).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).join('.') : '') + ' → ' + Math.round(e.getBoundingClientRect().right) + 'px');
    const unsized = [...document.images].filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).slice(0, 5).map((i) => i.getAttribute('src'));
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
    return { scrollW: document.documentElement.scrollWidth, W, H: document.documentElement.scrollHeight, wide, unsized, broken };
  })()`);
  if (info.scrollW > info.W) problems.push(`horizontal overflow: page is ${info.scrollW}px wide at ${info.W}px` + (info.wide.length ? ' (' + info.wide.join(', ') + ')' : ''));
  info.broken.forEach((s) => problems.push('broken image: ' + s));
  info.unsized.forEach((s) => problems.push('image without width/height: ' + s));

  // full-page screenshot: grow the viewport to the page height (no captureBeyondViewport,
  // which restarts CSS animations and drops layers), then put it back
  const file = `${OUT}${name}-${width}.png`;
  const fullH = Math.min(info.H, 16000);
  await b.setViewport(width, fullH);
  await b.eval("window.scrollTo(0, 0); document.querySelectorAll('[data-reveal], [data-split]').forEach((e) => e.classList.add('is-in')); 1");   // scroll reveals
  await b.sleep(1200);
  await b.shot(file);
  await b.setViewport(width, 900);

  const uniq = [...new Set(problems)];
  console.log(`${uniq.length ? 'FAIL' : 'ok  '} ${width}px  ${info.W}×${info.H}  → ${file}`);
  uniq.forEach((p) => console.log('     ' + p));
  if (uniq.length) failed = true;
  await b.close();
}
process.exit(failed ? 1 : 0);
