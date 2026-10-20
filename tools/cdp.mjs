// Minimal Chrome DevTools Protocol client (Node 22+: global WebSocket / fetch), no dependencies.
// Chrome: $CHROME_PATH, else the usual macOS / Linux locations.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    const r = spawnSync('which', [bin], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  throw new Error('Chrome not found. Install Chrome / Chromium or set CHROME_PATH.');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ width = 1440, height = 900, dpr = 1, mobile = false } = {}) {
  const port = 9300 + Math.floor(Math.random() * 600);
  const profile = mkdtempSync(join(tmpdir(), 'foley-cdp-'));
  const proc = spawn(findChrome(), ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  let list = [];
  for (let i = 0; i < 100; i++) {
    try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (list.find((t) => t.type === 'page')) break; } catch {}
    await sleep(150);
  }
  const cleanup = () => { try { proc.kill(); } catch {} try { rmSync(profile, { recursive: true, force: true }); } catch {} };
  process.once('exit', cleanup);
  const page = list.find((t) => t.type === 'page');
  if (!page) { cleanup(); throw new Error('Chrome did not start'); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result); }
    else listeners.forEach((l) => l(d));
  };
  // every call times out (default 30s) so a stuck page never hangs the tool
  const send = (method, params = {}, timeout = 30000) => new Promise((res, rej) => {
    const i = ++id;
    const t = setTimeout(() => { pending.delete(i); rej(new Error(`CDP ${method} timed out after ${timeout}ms`)); }, timeout);
    pending.set(i, { res: (v) => { clearTimeout(t); res(v); }, rej: (e) => { clearTimeout(t); rej(e); } });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  const setViewport = (w, h, d = dpr, m = mobile) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: d, mobile: m });
  await setViewport(width, height);
  return {
    send, sleep, setViewport,
    on: (fn) => listeners.push(fn),
    async goto(url, wait = 1200) {
      const loaded = new Promise((r) => { const f = (d) => { if (d.method === 'Page.loadEventFired') r(); }; listeners.push(f); setTimeout(r, 15000); });
      await send('Page.navigate', { url });
      await loaded;
      await sleep(wait);
    },
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    /** Screenshot of the viewport (or a clip in page coordinates). Use viewport bands for tall pages:
        captureBeyondViewport restarts CSS animations and drops layers. */
    async shot(file, clip) {
      const r = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) }, 90000);
      writeFileSync(file, Buffer.from(r.data, 'base64'));
    },
    async mouse(x, y, type = 'mouseMoved') { await send('Input.dispatchMouseEvent', { type, x, y, button: 'none', pointerType: 'mouse' }); },
    async click(x, y) {
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    },
    async close() { try { ws.close(); } catch {} await sleep(100); cleanup(); },
  };
}
