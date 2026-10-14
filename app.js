/* Foley landing v2 – motion + interaction
   Modules: top nav + mega menu · hero scenes · reveals · logos · scroll engine ·
            stages hint · snapshot · cases · demo panel */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);

  const SHOT = params.has('shot');                                         // static frame for pixel-diff
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;       // reduced motion
  const SLOW = Math.max(1, parseFloat(params.get('slow')) || 1);
  const ANIM = !SHOT && !RM;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

  root.style.setProperty('--slow', SLOW);
  if (SHOT) root.classList.add('shot');

  /* ======================================================================
     Top navigation: mega menu (hover intent, click, keyboard) + mobile drawer
     ====================================================================== */
  const topnav = $('[data-topnav]');
  const triggers = $$('.nav-trigger', topnav);
  const panels = Object.fromEntries($$('.mm-panel', topnav).map((p) => [p.dataset.panel, p]));
  const menuOrder = triggers.map((t) => t.dataset.menu);
  let openMenu = null;
  let openedAt = 0;
  let openTimer = 0;
  let closeTimer = 0;
  let menuScrollY = 0;

  Object.values(panels).forEach((p) => { p.hidden = false; p.inert = true; });

  function setMenu(name, { focus = false } = {}) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (name === openMenu) return;
    const prev = openMenu;
    openMenu = name;
    openedAt = performance.now();
    menuScrollY = scrollY;
    // direction of travel when switching menus: content slides in from that side
    const dir = prev && name ? Math.sign(menuOrder.indexOf(name) - menuOrder.indexOf(prev)) : 0;
    if (name) { panels[name].style.setProperty('--dir', dir); void panels[name].offsetWidth; }
    if (prev) panels[prev].style.setProperty('--dir', -dir);
    topnav.classList.toggle('is-open', !!name);
    topnav.classList.toggle('is-switching', !!(name && prev));
    triggers.forEach((t) => t.setAttribute('aria-expanded', String(t.dataset.menu === name)));
    Object.entries(panels).forEach(([k, p]) => {
      p.classList.toggle('is-active', k === name);
      p.inert = k !== name;
    });
    if (focus && name) { const first = $('a', panels[name]); if (first) first.focus(); }
  }
  const closeSoon = (ms = 220) => { clearTimeout(openTimer); clearTimeout(closeTimer); closeTimer = setTimeout(() => setMenu(null), ms); };

  if (FINE) {
    triggers.forEach((t) => {
      t.addEventListener('pointerenter', () => {
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = setTimeout(() => setMenu(t.dataset.menu), openMenu ? 60 : 120);
      });
    });
    $$('.logo, .head-cta, .nav-link', topnav).forEach((el) => el.addEventListener('pointerenter', () => openMenu && closeSoon(160)));
    $('.mm-stage', topnav).addEventListener('pointerenter', () => clearTimeout(closeTimer));
    topnav.addEventListener('pointerleave', () => closeSoon());
  }
  triggers.forEach((t) => {
    t.addEventListener('click', () => {
      const name = t.dataset.menu;
      // a click right after hover-intent opened this menu keeps it open
      if (openMenu === name && performance.now() - openedAt < 600) return;
      setMenu(openMenu === name ? null : name);
    });
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMenu(t.dataset.menu, { focus: true }); }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !openMenu) return;
    const t = triggers.find((x) => x.dataset.menu === openMenu);
    setMenu(null);
    if (t) t.focus();
  });
  document.addEventListener('pointerdown', (e) => { if (openMenu && !e.target.closest('[data-topnav]')) setMenu(null); });
  topnav.addEventListener('focusout', (e) => { if (openMenu && e.relatedTarget && !topnav.contains(e.relatedTarget)) setMenu(null); });
  topnav.addEventListener('click', (e) => { if (e.target.closest('.megamenu a')) setMenu(null); });
  addEventListener('scroll', () => { if (openMenu && Math.abs(scrollY - menuScrollY) > 60) setMenu(null); }, { passive: true });
  if (params.get('menu') in panels) setMenu(params.get('menu'));

  /* mobile drawer */
  const burger = $('[data-burger]');
  const drawer = $('[data-drawer]');
  function setDrawer(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });
  addEventListener('resize', () => { if (innerWidth >= 960 && !drawer.hidden) setDrawer(false); });

  /* ======================================================================
     Hero scenes: a 6x4 tile grid, every tile shows its slice of a scene
     ====================================================================== */
  const hero = $('#hero');
  const grid = $('[data-hero-grid]');
  const wordEl = $('[data-hero-word]');

  const SCENES = [
    { id: 'hire',    word: 'Hire',    src: 'assets/hero/scenes/hire.webp' },
    { id: 'onboard', word: 'Onboard', src: 'assets/hero/scenes/onboard.webp' },
    { id: 'monitor', word: 'Monitor', src: 'assets/hero/scenes/monitor.webp' },
  ];
  const START = 1;                                                          // Onboard = the Figma frame

  // occupied cells = three 3x2 photo blocks laid out in a staircase (same in every scene)
  const A_CELLS = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
  const B_CELLS = [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]];
  const occupied = new Set([
    ...A_CELLS.map(([c, r]) => `${c + 1},${r}`),
    ...A_CELLS.map(([c, r]) => `${c + 3},${r + 1}`),
    ...B_CELLS.map(([c, r]) => `${c + 2},${r + 2}`),
  ]);
  const FILL = new Set(['0,0', '4,0', '1,2', '2,2', '3,2', '2,3', '3,3', '4,3']);   // 4% white placeholders from Figma

  const FX = {
    wave: { dur: 900,  delay: (c, r) => (c + (3 - r)) * 55 },
    flip: { dur: 1000, delay: (c, r) => ((c * 7 + r * 13) % 5) * 55 + (c + r) * 25 },
    fade: { dur: 1100, delay: (c, r) => (c + r) * 30 },
  };
  const state = { fx: params.get('fx') in FX ? params.get('fx') : (RM ? 'fade' : 'wave'), auto: ANIM };

  let cur = -1;
  let swapping = false;
  let pending = null;
  let tiles = [];
  const SCENE_MS = 6000;

  const loadImg = (src) => new Promise((resolve) => {
    const im = new Image();
    im.src = src;
    (im.decode ? im.decode() : Promise.resolve()).then(() => resolve(im)).catch(() => resolve(im));
  });

  function fitHero() {
    const w = innerWidth;
    root.style.setProperty('--k', (w >= 960 ? Math.min(1, w / 1440) : 1).toFixed(4));
  }

  function buildGrid() {
    const frag = document.createDocumentFragment();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const key = `${c},${r}`;
        const occ = occupied.has(key);
        const fill = FILL.has(key);
        if (!occ && !fill) continue;
        const el = document.createElement('div');
        el.className = 'tile' + (fill ? ' is-fill' : '');
        el.style.setProperty('--c', c);
        el.style.setProperty('--r', r);
        if (occ) el.innerHTML = '<i class="f f-cur"></i><i class="f f-nxt"></i>';
        frag.append(el);
        if (occ) tiles.push({ el, c, r });
      }
    }
    grid.append(frag);
  }

  /* headline word: letters roll up and out, new letters roll in from below */
  function makeWord(text) {
    const w = document.createElement('span');
    w.className = 'w';
    [...text].forEach((chr, i) => {
      const c = document.createElement('span');
      c.className = 'ch';
      const ci = document.createElement('span');
      ci.className = 'chi';
      ci.style.setProperty('--i', i);
      ci.textContent = chr;
      c.append(ci);
      w.append(c);
    });
    return w;
  }
  function setWord(text, animate) {
    const old = $('.w.is-cur', wordEl);
    const w = makeWord(text);
    wordEl.append(w);
    if (!animate) { w.classList.add('is-cur'); if (old) old.remove(); return; }
    void w.offsetWidth;
    requestAnimationFrame(() => {
      w.classList.add('is-cur');
      if (old) {
        old.classList.remove('is-cur');
        old.classList.add('is-out');
        setTimeout(() => old.remove(), 1400 * SLOW);
      }
    });
  }

  /* pausable timer: drives hero autoplay and the snapshot rotation (no visible progress UI) */
  function pausableTimer(ms, onDone) {
    let id = 0, left = ms, t0 = 0, running = false;
    return {
      resume() { if (running) return; running = true; t0 = performance.now(); id = setTimeout(() => { running = false; left = ms; onDone(); }, left); },
      pause() { if (!running) return; clearTimeout(id); running = false; left = Math.max(0, left - (performance.now() - t0)); },
      reset() { clearTimeout(id); running = false; left = ms; },
    };
  }

  function swap(i, { intro = false } = {}) {
    swapping = true;
    const scene = SCENES[i];
    const fx = FX[state.fx];
    const base = intro ? 320 : 0;

    grid.classList.remove('fx-wave', 'fx-flip', 'fx-fade');
    grid.classList.add('fx-' + state.fx);
    grid.style.setProperty('--nxt', `url("${scene.src}")`);

    let maxD = 0;
    tiles.forEach((t) => {
      const d = (fx.delay(t.c, t.r) + base) * SLOW;
      maxD = Math.max(maxD, d);
      t.el.style.setProperty('--d', d + 'ms');
    });

    if (!intro) setWord(scene.word, true);
    void grid.offsetWidth;
    grid.classList.add('is-swap');

    setTimeout(() => {
      grid.style.setProperty('--cur', `url("${scene.src}")`);
      grid.classList.remove('is-swap');
      swapping = false;
      cur = i;
      if (pending !== null && pending !== cur) { const p = pending; pending = null; swap(p); }
      else { pending = null; heroAuto(true); }
    }, maxD + fx.dur * SLOW + 80);
  }

  function go(i) {
    if (i === cur) return;
    if (swapping) { pending = i; return; }
    swap(i);
  }
  const next = () => go((cur + 1) % SCENES.length);

  /* autoplay: 6s per scene once the intro is done; paused on hover, hidden tab, off-screen */
  const heroTimer = pausableTimer(SCENE_MS * SLOW, () => (swapping ? heroAuto(true) : next()));
  function heroAuto(reset) {
    if (reset) heroTimer.reset();
    const run = ANIM && state.auto && hero.classList.contains('is-live') && pauseReasons.size === 0;
    run ? heroTimer.resume() : heroTimer.pause();
  }

  async function initHero() {
    fitHero();
    buildGrid();
    const first = SCENES[START];
    await loadImg(first.src);

    if (!ANIM) {
      // static: settle immediately (also used by ?shot and reduced motion)
      grid.classList.add('fx-' + state.fx);
      grid.style.setProperty('--cur', `url("${first.src}")`);
      setWord(first.word, false);
      cur = START;
      hero.classList.add('is-ready');
      if (RM) hero.classList.add('is-live');
      return;
    }

    setWord(first.word, true);
    hero.classList.add('is-ready');
    swap(START, { intro: true });
    setTimeout(() => { hero.classList.add('is-live'); heroAuto(true); }, 2000 * SLOW);
    // warm the other scenes so the first switch is instant
    SCENES.forEach((s, k) => { if (k !== START) setTimeout(() => loadImg(s.src), 600); });
  }

  const pauseReasons = new Set();
  function setPause(reason, on) {
    on ? pauseReasons.add(reason) : pauseReasons.delete(reason);
    hero.classList.toggle('is-paused', pauseReasons.size > 0);
    heroAuto(false);
  }
  grid.addEventListener('pointerenter', () => FINE && setPause('hover', true));
  grid.addEventListener('pointerleave', () => setPause('hover', false));
  document.addEventListener('visibilitychange', () => setPause('hidden', document.hidden));
  new IntersectionObserver(([e]) => setPause('offscreen', !e.isIntersecting), { threshold: 0.25 }).observe(hero);

  /* pointer parallax on the tile grid */
  if (ANIM && FINE) {
    let tx = 0, ty = 0, px = 0, py = 0, raf = 0;
    const loop = () => {
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      grid.style.setProperty('--px', px.toFixed(2) + 'px');
      grid.style.setProperty('--py', py.toFixed(2) + 'px');
      raf = (Math.abs(tx - px) > 0.05 || Math.abs(ty - py) > 0.05) ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', (e) => {
      const b = hero.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * -18;
      ty = ((e.clientY - b.top) / b.height - 0.5) * -12;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ======================================================================
     Reveals: split headings into masked words, fade-up blocks, counters
     ====================================================================== */
  function splitWords(el) {
    let n = 0;
    const walk = (node, out) => {
      node.childNodes.forEach((ch) => {
        if (ch.nodeType === 3) {
          ch.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { out.append(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--i', n++);
            wi.textContent = tok;
            w.append(wi);
            out.append(w);
          });
        } else if (ch.nodeType === 1) {
          if (ch.tagName === 'BR') out.append(ch.cloneNode());
          else { const c = ch.cloneNode(false); walk(ch, c); out.append(c); }
        }
      });
    };
    const frag = document.createElement('div');
    walk(el, frag);
    el.textContent = '';
    while (frag.firstChild) el.append(frag.firstChild);
  }

  $$('[data-split]').forEach(splitWords);

  const revealEls = $$('[data-reveal], [data-split]');
  if (ANIM) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* counter: Trusted by 50,000 customers */
  $$('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    if (!ANIM) return;
    el.textContent = '0';
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 1700 * SLOW;
      const tick = (now) => {
        const p = clamp((now - t0) / dur);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* logos marquee: clone the row once for a seamless loop */
  const track = $('.marquee-track');
  if (track && !RM) {
    $$('li', track).forEach((li) => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $('img', c).alt = '';
      track.append(c);
    });
  }

  /* ======================================================================
     Scroll engine: progress, sticky header, hero parallax, image parallax,
     panel "curtain", active nav link
     ====================================================================== */
  const parallax = $$('[data-parallax]').map((el) => ({ el, speed: parseFloat(el.dataset.parallax) || 0, box: el.parentElement }));
  const expand = $$('[data-expand]');

  let ticking = false;
  function frame() {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;

    topnav.classList.toggle('is-stuck', y > 33);

    if (!ANIM) return;

    // hero: content drifts up and fades, tiles + background move at different speeds
    const hh = hero.offsetHeight || 627;
    if (y < hh + 80) {
      const p = clamp(y / hh);
      hero.style.setProperty('--bg-y', (p * 90).toFixed(1) + 'px');
      hero.style.setProperty('--dots-y', (p * -50).toFixed(1) + 'px');
      hero.style.setProperty('--grid-y', (p * 70).toFixed(1) + 'px');
      hero.style.setProperty('--copy-y', (p * -54).toFixed(1) + 'px');
      hero.style.setProperty('--copy-o', clamp(1 - p * 1.25).toFixed(3));
    }

    // image parallax inside overflow:hidden frames
    for (const p of parallax) {
      const r = p.box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const off = (r.top + r.height / 2) - vh / 2;
      const ty = off * p.speed;
      p.el.style.setProperty('--py', ty.toFixed(1) + 'px');
      // scale only as much as the shift needs, so the frame is exactly 1:1 when centred
      p.el.style.setProperty('--sc', (1 + Math.abs(ty) / (r.height / 2) + 0.004).toFixed(4));
    }

    // dark panels open like a curtain as they enter
    for (const el of expand) {
      if (el.classList.contains('is-full')) continue;
      const r = el.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.62));
      const e = 1 - Math.pow(1 - p, 3);
      el.style.setProperty('--p', e.toFixed(4));
      if (p >= 0.999) el.classList.add('is-full');
    }
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { fitHero(); fitSnap(); layoutCases(); request(); });
  if (!ANIM) expand.forEach((el) => el.classList.add('is-full'));

  /* ======================================================================
     Platform: play the hover states once when the panel first appears
     ====================================================================== */
  const panel = $('.stages-panel');
  if (ANIM && panel && window.FoleyStages) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setTimeout(() => window.FoleyStages.hint(), 900 * SLOW);
    }, { threshold: 0.7 });
    io.observe(panel);
  }

  /* ======================================================================
     Snapshot: one product shot, three "camera" focus points
     ====================================================================== */
  const snap = $('[data-snap]');
  const snapItems = $$('.snap-item', snap);
  const snapShot = $('.snap-shot', snap);
  const snapImg = $('.snap-img', snap);
  const snapPanel = $('#snap-panel');
  let snapIdx = 0;

  function fitSnap() {
    if (!snapShot) return;
    const [fx, fy, s] = snapItems[snapIdx].dataset.focus.split(',').map(parseFloat);
    const W = snapShot.clientWidth, H = snapShot.clientHeight;
    const tx = clamp(W / 2 - s * fx * W, -(s - 1) * W, 0);
    const ty = clamp(H / 2 - s * fy * H, -(s - 1) * H, 0);
    snapImg.style.setProperty('--tx', tx.toFixed(1) + 'px');
    snapImg.style.setProperty('--ty', ty.toFixed(1) + 'px');
    snapImg.style.setProperty('--s', s);
  }
  function setSnap(i, focus = false) {
    snapIdx = i;
    snapItems.forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.setAttribute('aria-selected', String(k === i));
      b.tabIndex = k === i ? 0 : -1;
    });
    snapPanel.setAttribute('aria-labelledby', snapItems[i].id);
    fitSnap();
    if (focus) snapItems[i].focus();
    snapAuto(true);
  }
  /* rotation: 6s per view while the block is on screen; paused on hover / focus */
  const snapTimer = pausableTimer(6000 * SLOW, () => setSnap((snapIdx + 1) % snapItems.length));
  const snapHold = new Set();
  let snapLive = false;
  function snapAuto(reset) {
    if (reset) snapTimer.reset();
    (ANIM && state.auto && snapLive && !snapHold.size) ? snapTimer.resume() : snapTimer.pause();
  }
  if (snap) {
    snapItems.forEach((b, k) => {
      b.addEventListener('click', () => setSnap(k));
      b.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        setSnap((k + dir + snapItems.length) % snapItems.length, true);
      });
    });
    const hold = (reason, on) => { on ? snapHold.add(reason) : snapHold.delete(reason); snapAuto(false); };
    snap.addEventListener('pointerenter', () => FINE && hold('hover', true));
    snap.addEventListener('pointerleave', () => hold('hover', false));
    snap.addEventListener('focusin', () => hold('focus', true));
    snap.addEventListener('focusout', () => hold('focus', false));
    new IntersectionObserver(([e]) => { snapLive = e.isIntersecting; snapAuto(false); }, { threshold: 0.45 }).observe(snap);
    new ResizeObserver(fitSnap).observe(snapShot);
    fitSnap();
  }

  /* ======================================================================
     Cases carousel (arrows, drag / swipe, keys)
     ====================================================================== */
  const cViewport = $('[data-cases-viewport]');
  const cTrack = $('[data-cases-track]');
  const cPrev = $('[data-cases-prev]');
  const cNext = $('[data-cases-next]');
  const cSlides = $$('.case', cTrack);
  let cIdx = 0;
  const perView = () => (innerWidth < 960 ? 1 : 2);
  const caseGap = () => parseFloat(getComputedStyle(cTrack).columnGap) || 20;
  const maxIdx = () => Math.max(0, cSlides.length - perView());

  function layoutCases(animate = true) {
    if (!cTrack) return;
    cIdx = clamp(cIdx, 0, maxIdx());
    const step = cSlides[0].offsetWidth + caseGap();
    cTrack.classList.toggle('is-dragging', !animate);
    cTrack.style.setProperty('--x', -cIdx * step + 'px');
    cPrev.disabled = cIdx <= 0;
    cNext.disabled = cIdx >= maxIdx();
  }
  function goCase(i) { cIdx = clamp(i, 0, maxIdx()); layoutCases(); }

  if (cTrack) {
    cPrev.addEventListener('click', () => goCase(cIdx - 1));
    cNext.addEventListener('click', () => goCase(cIdx + 1));
    cViewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goCase(cIdx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goCase(cIdx + 1); }
    });

    let down = false, sx = 0, dx = 0, moved = false, startX0 = 0;
    cViewport.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('a')) return;
      down = true; moved = false; sx = e.clientX; dx = 0;
      startX0 = -cIdx * (cSlides[0].offsetWidth + caseGap());
      cViewport.setPointerCapture(e.pointerId);
    });
    cViewport.addEventListener('pointermove', (e) => {
      if (!down) return;
      dx = e.clientX - sx;
      if (Math.abs(dx) > 6) { moved = true; cViewport.classList.add('is-drag'); cTrack.classList.add('is-dragging'); }
      if (moved) cTrack.style.setProperty('--x', (startX0 + dx) + 'px');
    });
    const end = () => {
      if (!down) return;
      down = false;
      cViewport.classList.remove('is-drag');
      cTrack.classList.remove('is-dragging');
      if (moved && Math.abs(dx) > 60) goCase(cIdx + (dx < 0 ? 1 : -1));
      else layoutCases();
    };
    cViewport.addEventListener('pointerup', end);
    cViewport.addEventListener('pointercancel', end);
    cViewport.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    layoutCases(false);
  }

  /* ======================================================================
     Demo panel ( . )
     ====================================================================== */
  const demo = $('#demo');
  function syncDemo() {
    if (!demo) return;
    const curState = {
      scene: SCENES[Math.max(0, cur)] ? SCENES[Math.max(0, cur)].id : 'onboard',
      fx: state.fx,
      auto: state.auto ? 'on' : 'off',
      menu: openMenu || 'none',
      slow: String(SLOW),
    };
    $$('.seg', demo).forEach((seg) => $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === curState[seg.dataset.key]))));
  }
  if (demo) {
    demo.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const key = b.closest('.seg').dataset.key;
      if (key === 'scene') go(SCENES.findIndex((s) => s.id === b.dataset.v));
      if (key === 'fx') state.fx = b.dataset.v;
      if (key === 'menu') setMenu(b.dataset.v === 'none' ? null : b.dataset.v);
      if (key === 'auto') {
        state.auto = b.dataset.v === 'on';
        heroAuto(true);
        if (snap) snapAuto(true);
      }
      if (key === 'slow') {
        const u = new URL(location.href);
        u.searchParams.set('slow', b.dataset.v);
        location.href = u.toString();
        return;
      }
      setTimeout(syncDemo, 60);
      syncDemo();
    });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea')) return;
      if (e.key === '.') { demo.hidden = !demo.hidden; syncDemo(); }
      else if (e.key === 'Escape' && !openMenu) demo.hidden = true;
    });
    if (params.has('panel')) { demo.hidden = false; }
    setInterval(syncDemo, 800);
    syncDemo();
  }

  /* ?shot mirrors the Figma frame: first team row is shown hovered */
  if (SHOT) { const row = $('.team-row'); if (row) row.classList.add('is-hover'); }

  /* ---------- boot ---------- */
  initHero();
  frame();
})();
