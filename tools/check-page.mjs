#!/usr/bin/env node
/**
 * Check a page the way a reviewer would, at 1440, 1024 and 390 wide:
 *   - JS errors, console errors, 404s / failed requests, broken images, images without width/height
 *   - horizontal overflow of the page
 *   - screenshots in tools/out/: <page>-<width>-01.png, -02.png … one per viewport (readable),
 *     plus <page>-<width>-full.png for the whole page (pages up to 16000px tall)
 * Errors are checked on the live page; screenshots use ?shot (animations and autoplay frozen,
 * scroll reveals shown) so they are stable.
 *
 *   npm run check:page -- hiring.html            (site server on :4965 must be running)
 *   npm run check:page -- hiring.html 390        (one width)
 *   npm run check:page -- http://127.0.0.1:4965/modules.html 1440
 *
 * Exit code 1 when something is wrong, so it can be used as a gate. Each width is capped at 90s.
 */
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const [target = 'index.html', ...w] = process.argv.slice(2);
const url = /^https?:/.test(target) ? target : `http://127.0.0.1:4965/${target.replace(/^\//, '')}`;
const shotUrl = url + (url.includes('?') ? '&' : '?') + 'shot';
const widths = w.length ? w.map(Number) : [1440, 1024, 390];
const OUT = fileURLToPath(new URL('./out/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const name = url.split('/').pop().replace(/[?#].*$/, '').replace(/\.html$/, '') || 'index';
const VIEW_H = 900;

async function checkWidth(width) {
  const b = await launch({ width, height: VIEW_H });
  try {
    const problems = [];
    b.on((d) => {
      if (d.method === 'Runtime.exceptionThrown') problems.push('JS: ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).split('\n')[0]);
      if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') problems.push('console.error: ' + d.params.args.map((a) => a.value || a.description).join(' ').slice(0, 200));
      if (d.method === 'Network.responseReceived' && d.params.response.status >= 400) problems.push(`HTTP ${d.params.response.status}: ${d.params.response.url}`);
      if (d.method === 'Network.loadingFailed' && !d.params.canceled) problems.push(`request failed: ${d.params.errorText}`);
    });
    await b.send('Network.enable');

    /* 1. live page: errors, images, overflow */
    await b.goto(url, 1500);
    await b.eval(`(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }); return Promise.race([Promise.all([...document.images].map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 8000))]).then(() => 1); })()`);
    await b.sleep(300);
    const info = await b.eval(`(() => {
      const W = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll('body *')].filter((e) => {
        const r = e.getBoundingClientRect(); if (r.width === 0 || r.right <= W + 1) return false;
        for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) return false; }
        return true;
      }).slice(0, 5).map((e) => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/).join('.') : '') + ' → ' + Math.round(e.getBoundingClientRect().right) + 'px');
      const unsized = [...document.images].filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).slice(0, 5).map((i) => i.getAttribute('src'));
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
      const h1 = document.querySelectorAll('h1').length;
      return { scrollW: document.documentElement.scrollWidth, W, wide, unsized, broken, h1 };
    })()`);
    if (info.scrollW > info.W) problems.push(`horizontal overflow: page is ${info.scrollW}px wide at ${info.W}px` + (info.wide.length ? ' (' + info.wide.join(', ') + ')' : ''));
    info.broken.forEach((s) => problems.push('broken image: ' + s));
    info.unsized.forEach((s) => problems.push('image without width/height: ' + s));
    if (info.h1 !== 1) problems.push(`page has ${info.h1} <h1> (expected exactly 1)`);

    /* 2. ?shot page: screenshots */
    await b.goto(shotUrl, 1200);
    await b.eval(`(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }); document.querySelectorAll('[data-reveal], [data-split]').forEach((e) => e.classList.add('is-in')); return Promise.race([Promise.all([...document.images].map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 8000))]).then(() => 1); })()`);
    const H = await b.eval('document.documentElement.scrollHeight');
    readdirSync(OUT).filter((f) => f.startsWith(`${name}-${width}-`)).forEach((f) => rmSync(OUT + f));
    const files = [];
    for (let y = 0, k = 1; y < H; y += VIEW_H, k++) {
      await b.eval(`window.scrollTo(0, ${y})`);
      await b.sleep(250);
      const sy = await b.eval('scrollY');
      const f = `${OUT}${name}-${width}-${String(k).padStart(2, '0')}.png`;
      await b.shot(f, { x: 0, y: sy, width, height: Math.min(VIEW_H, H - sy) });
      files.push(f);
    }
    let full = '';
    if (H <= 16000) {                                   // overview: grow the viewport to the page (no captureBeyondViewport)
      await b.setViewport(width, H);
      await b.eval('window.scrollTo(0, 0)');
      await b.sleep(500);
      full = `${OUT}${name}-${width}-full.png`;
      await b.shot(full);
    }
    return { problems: [...new Set(problems)], W: info.W, H, bands: files.length, full };
  } finally {
    await b.close();
  }
}

let failed = false;
for (const width of widths) {
  let res;
  try {
    res = await Promise.race([checkWidth(width), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 90s')), 90000))]);
  } catch (e) {
    console.log(`FAIL ${width}px  ${e.message}`);
    failed = true;
    continue;
  }
  console.log(`${res.problems.length ? 'FAIL' : 'ok  '} ${width}px  ${res.W}×${res.H}  → tools/out/${name}-${width}-01…${String(res.bands).padStart(2, '0')}.png${res.full ? ' + -full.png' : ' (no -full.png: page taller than 16000px)'}`);
  res.problems.forEach((p) => console.log('     ' + p));
  if (res.problems.length) failed = true;
}
process.exit(failed ? 1 : 0);
