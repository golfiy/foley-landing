/* Foley landing v2 – motion + interaction
   Modules: top nav + mega menu · hero scenes · reveals · logos · scroll engine ·
            stages hint · snapshot · cases · demo panel */
(() => {
  'use strict';

  const $ = (s, r = document) => (r ? r.querySelector(s) : null);
  const $$ = (s, r = document) => (r ? [...r.querySelectorAll(s)] : []);
  // $o: like $, but returns a detached stub when the element is missing, so a page (or a Storybook story)
  // that only contains some of the blocks still boots: modules without their markup become no-ops
  const $o = (s, r) => $(s, r) || document.createElement('div');
  const present = (el) => !!el && el.isConnected;
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
  const topnav = $o('[data-topnav]');
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
    if (name) closeSearch(false);
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
    $o('.mm-stage', topnav).addEventListener('pointerenter', () => clearTimeout(closeTimer));
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

  /* mobile drawer */
  const burger = $o('[data-burger]');
  const drawer = $o('[data-drawer]');
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
     Site search: index built from the menus and the page, grouped results,
     combobox keyboard model, results jump to the matching place on the page
     ====================================================================== */
  const sp = $o('[data-search]');
  const spInput = $o('#sp-input');
  const spList = $o('#sp-list');
  const spPopular = $o('[data-sp-popular]');
  const spNote = $o('[data-sp-note]');
  const spNone = $o('[data-sp-none]');
  const spCount = $o('#sp-count');
  const spClear = $o('.sp-clear');
  const spBackdrop = $o('[data-search-backdrop]');
  const spOpeners = $$('[data-search-open]');
  const IDX = [];
  let spOpen = false;
  let spOpener = null;
  let spShown = [];
  let spActive = -1;
  let spScrollY = 0;

  const STOP = new Set(['and', 'of', 'the', 'a', 'to', 'for', 'in', 'on', 'with', 'by', 'your', 'what', 'do', 'i', 'be']);
  const norm = (t) => t.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9%]+/g, ' ').trim();
  const words = (t) => norm(t).split(' ').filter(Boolean);
  const escHtml = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // extra keywords so people find things by the words they actually type
  const SYN = {
    'motor vehicle records': 'mvr', 'mvr monitor': 'motor vehicle records', 'drug and alcohol testing': 'drug test screening testing',
    'pricing': 'price cost plans quote', 'request a demo': 'demo sales talk contact', 'fmcsa clearinghouse': 'clearinghouse query',
    'driver qualification files': 'dq dqf file', 'csa monitor': 'csa score safety', 'audit risk monitor': 'audit dot',
    'contact us': 'phone email support', 'careers': 'jobs hiring work', 'eld and hours of service': 'eld hos logs',
  };

  function addItem(label, crumb, group, go, extra = '') {
    const ln = norm(label);
    const sig = words(label).filter((w) => !STOP.has(w));
    const init = sig.length > 1 ? sig.map((w) => w[0]).join('') : '';
    const kw = words([crumb, extra, SYN[ln] || '', init, init.slice(0, 2)].join(' '));
    IDX.push({ label, crumb, group, go, ln, lw: words(label), kw });
  }

  function buildIndex() {
    if (IDX.length) return;
    const caseIdx = (name) => cSlides.findIndex((c) => ($('.case-logo img', c) || {}).alt?.includes(name));
    const teamRow = (label) => $$('.team-row').find((r) => norm($('.team-title', r).textContent) === norm(label));
    const faqCard = (re) => $$('.faq-card').find((c) => re.test($('h3', c).textContent));
    const stageFor = (col, label) => {
      if (col === 'Hiring and Onboarding') return /onboarding/i.test(label) ? 'onboard' : 'hire';
      if (col === 'Data Monitoring') return 'monitor';
      return 'onboard';
    };

    // On this page
    [['#platform', 'How it works'], ['#snapshot', 'Product snapshot'], ['#teams', 'Teams'], ['#guidance', 'Built-in guidance'],
     ['#results', 'Customer stories'], ['#resources', 'Guides'], ['#contact', 'Get started']].forEach(([sel, crumb]) => {
      const h = $(`${sel} h2`); if (h) addItem(h.textContent.trim(), `On this page › ${crumb}`, 'On this page', { sel, flash: false });
    });
    $$('[data-stage]').forEach((st) => {
      const t = $('.stage-title, .insights-title', st).textContent.trim();
      const extra = $$('.stage-sub, .insights-sub, .stage-links a, .insights-links a', st).map((x) => x.textContent).join(' ');
      addItem(t, 'How it works', 'On this page', { stage: st.dataset.stage }, extra);
    });
    $$('.snap-item').forEach((b, k) => addItem($('.snap-title', b).textContent.trim(), 'Product snapshot', 'On this page', { snap: k }));
    $$('.team-row').forEach((r) => addItem($('.team-title', r).textContent.trim(), 'Built for every team', 'On this page', { el: r, row: true }, $('.team-desc', r).textContent));
    $$('.faq-card').forEach((c) => addItem($('h3', c).textContent.trim(), 'Guides › Not sure where to start', 'Resources', { el: c }));
    cSlides.forEach((c, k) => {
      const who = ($('.case-logo img', c) || {}).alt || '';
      addItem($('h3', c).textContent.trim(), `Customer stories › ${who}`, 'Customer stories', { caseIdx: k }, `${who} ${$('.overline', c).textContent} ${$('blockquote', c).textContent} case study`);
    });

    // Mega menus
    $$('.mm-panel').forEach((panel) => {
      const group = panel.getAttribute('aria-label');
      $$('.mm-col', panel).forEach((col) => {
        const colT = $('.mm-title', col).textContent.trim();
        const colGo = group === 'Products' ? { stage: stageFor(colT, colT) }
          : group === 'Solutions' ? { sel: '#teams', flash: false }
          : group === 'Resources' ? { sel: '#resources', flash: false }
          : /why foley/i.test(colT) ? { sel: '#results', flash: false } : { sel: '.footer', flash: false };
        addItem(colT, group, group, colGo, $('.mm-desc', col).textContent);
        $$('.mm-links a', col).forEach((a) => {
          const label = a.textContent.trim();
          let go = { sel: '#platform', flash: false };
          if (group === 'Products') go = { stage: stageFor(colT, label) };
          if (group === 'Solutions') go = colT === 'By Role' && teamRow(label) ? { el: teamRow(label), row: true } : { sel: '#teams', flash: false };
          if (group === 'Resources') {
            const card = /driver qualification/i.test(label) ? faqCard(/DQ file/) : /fmcsa compliance guide/i.test(label) ? faqCard(/DOT compliant/) : null;
            go = card ? { el: card } : /case studies/i.test(label) ? { sel: '#results', flash: false } : { sel: '#resources', flash: false };
          }
          if (group === 'Company') go = /customers|case studies/i.test(label) ? { sel: '#results', flash: false } : /contact/i.test(label) ? { sel: '#contact', flash: false } : { sel: '.footer', flash: false };
          addItem(label, `${group} › ${colT}`, group, go);
        });
      });
      const promo = $('.mm-promo', panel);
      if (promo) {
        const title = $('.mm-promo-title', promo).textContent.trim();
        const k = /koppers/i.test(title) ? caseIdx('Koppers') : /autonomous/i.test(title) ? caseIdx('Torc') : -1;
        addItem(title, `${group} › ${$('.mm-promo-label', promo).textContent.trim()}`, group === 'Resources' ? 'Resources' : 'Customer stories',
          k >= 0 ? { caseIdx: k } : { sel: group === 'Resources' ? '#resources' : '#results', flash: false }, 'case study story webinar');
      }
      $$('.mm-foot a', panel).forEach((a) => addItem(a.textContent.trim(), group, group, { sel: a.getAttribute('href'), flash: false }));
    });

    // Top-level
    addItem('Pricing', 'Plans and quotes', 'Company', { sel: '#contact', flash: false });
    addItem('Request a demo', 'Talk to the Foley team', 'Company', { sel: '#contact', flash: false });
  }

  function score(it, toks, nq) {
    let total = 0;
    for (const t of toks) {
      let best = 0;
      for (const w of it.lw) { if (w === t) best = Math.max(best, 5); else if (w.startsWith(t)) best = Math.max(best, 3); }
      if (!best && t.length > 2 && it.ln.includes(t)) best = 2;
      if (!best) for (const w of it.kw) { if (w === t) best = Math.max(best, 2); else if (t.length > 1 && w.startsWith(t)) best = Math.max(best, 1); }
      if (!best && STOP.has(t)) continue;           // "drug and alcohol" should not fail on "and"
      if (!best) return 0;
      total += best;
    }
    if (it.ln.startsWith(nq)) total += 6;
    if (it.ln === nq) total += 10;
    if (it.group === 'Products' || it.group === 'Resources') total += 0.5;   // tie-break: product and guide pages before stories
    return total;
  }

  // one-typo tolerance (two for long words) as a fallback when nothing matches
  function editDist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  function correct(toks) {
    const vocab = new Set(IDX.flatMap((it) => it.lw.concat(it.kw)));
    let changed = false;
    const out = toks.map((t) => {
      if (t.length < 4 || vocab.has(t)) return t;
      const max = t.length >= 7 ? 2 : 1;
      let best = null, bd = max + 1;
      for (const w of vocab) { if (w.length < 3) continue; const d = editDist(t, w, max); if (d < bd) { bd = d; best = w; } }
      if (best) { changed = true; return best; }
      return t;
    });
    return changed ? out : null;
  }

  function highlight(label, toks) {
    const low = label.toLowerCase();
    const ranges = [];
    for (const t of toks) {
      if (STOP.has(t)) continue;
      let at = -1;
      const re = new RegExp(`(^|[^a-z0-9])(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
      const m = re.exec(low);
      if (m) at = m.index + m[1].length; else if (t.length > 2) at = low.indexOf(t);
      if (at >= 0) ranges.push([at, at + t.length]);
    }
    ranges.sort((x, y) => x[0] - y[0]);
    let out = '', pos = 0;
    for (const [a, b] of ranges) {
      if (a < pos) continue;
      out += escHtml(label.slice(pos, a)) + '<mark>' + escHtml(label.slice(a, b)) + '</mark>';
      pos = b;
    }
    return out + escHtml(label.slice(pos));
  }

  const SUGGESTED = ['Request a demo', 'What happens in a DOT audit?', 'Drug & Alcohol Testing', 'MVR Monitor', 'FMCSA Clearinghouse', 'Case Studies'];

  function renderSearch() {
    buildIndex();
    const q = spInput.value;
    const nq = norm(q);
    spClear.hidden = !q;
    spPopular.hidden = !!nq;
    spNote.hidden = true;
    let results;
    let toks = nq ? nq.split(' ') : [];
    if (!nq) {
      results = SUGGESTED.map((l) => IDX.find((it) => it.label === l)).filter(Boolean).map((it) => ({ it, s: 1, g: 'Suggested' }));
    } else {
      results = IDX.map((it) => ({ it, s: score(it, toks, nq) })).filter((r) => r.s > 0);
      if (!results.length) {
        const fixed = correct(toks);
        if (fixed) {
          const fq = fixed.join(' ');
          results = IDX.map((it) => ({ it, s: score(it, fixed, fq) })).filter((r) => r.s > 0);
          if (results.length) { toks = fixed; spNote.hidden = false; spNote.innerHTML = `Showing results for <b>${escHtml(fq)}</b>`; }
        }
      }
      // collapse exact duplicates (same label, same group), keep the best one
      const seen = new Map();
      results.sort((a, b) => b.s - a.s).forEach((r) => { const k = r.it.group + '|' + r.it.ln; if (!seen.has(k)) seen.set(k, r); });
      results = [...seen.values()];
    }

    // group, order groups by their best hit, cap each group
    const groups = new Map();
    results.forEach((r) => { const g = r.g || r.it.group; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(r); });
    const ordered = [...groups.entries()].sort((a, b) => b[1][0].s - a[1][0].s);
    spShown = [];
    let html = '';
    ordered.forEach(([g, rs], gi) => {
      const list = rs.slice(0, nq ? 6 : 8);
      html += `<div class="sp-group" role="group" aria-labelledby="spg-${gi}"><p class="sp-label" id="spg-${gi}" role="presentation">${escHtml(g)}${nq ? ` <span>${rs.length}</span>` : ''}</p>`;
      list.forEach((r) => {
        const k = spShown.length;
        spShown.push(r.it);
        html += `<div class="sp-opt" role="option" id="spo-${k}" data-k="${k}" aria-selected="false">`
          + `<span class="sp-opt-main"><span class="sp-opt-title">${nq ? highlight(r.it.label, toks) : escHtml(r.it.label)}</span><span class="sp-opt-crumb">${escHtml(r.it.crumb)}</span></span>`
          + `<span class="sp-opt-go" aria-hidden="true">Open <kbd>↵</kbd></span></div>`;
      });
      html += '</div>';
    });
    spList.innerHTML = html;
    spNone.hidden = !(nq && !spShown.length);
    if (!spNone.hidden) $o('[data-sp-q]', spNone).textContent = `“${q.trim()}”`;
    const n = nq ? results.length : 0;
    spCount.textContent = nq ? (n ? `${n} result${n === 1 ? '' : 's'}` : 'No results') : '';
    setActive(nq && spShown.length ? 0 : -1);
  }

  function setActive(k) {
    spActive = k;
    $$('.sp-opt', spList).forEach((o) => o.setAttribute('aria-selected', String(+o.dataset.k === k)));
    if (k >= 0) {
      spInput.setAttribute('aria-activedescendant', `spo-${k}`);
      const o = $(`#spo-${k}`);
      // scroll only the results list: scrollIntoView would also scroll the page (and any parent frame)
      const box = o && o.closest('.sp-body');
      if (box) {
        const r = o.getBoundingClientRect(), b = box.getBoundingClientRect();
        if (r.top < b.top) box.scrollTop -= b.top - r.top;
        else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom;
      }
    } else spInput.removeAttribute('aria-activedescendant');
  }

  function openSearch(opener, q = '') {
    if (!present(sp)) return;
    if (spOpen) { spInput.focus(); return; }
    spOpen = true;
    spOpener = opener || document.activeElement;
    setMenu(null);
    if (!drawer.hidden) setDrawer(false);
    sp.hidden = false;
    spBackdrop.hidden = false;
    void sp.offsetWidth;
    topnav.classList.add('is-searching');
    spBackdrop.classList.add('is-on');
    spOpeners.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    spInput.value = q;
    renderSearch();
    spScrollY = scrollY;
    if (innerWidth < 960) document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => spInput.focus({ preventScroll: true }));
  }

  function closeSearch(restoreFocus = true) {
    if (!spOpen) return;
    spOpen = false;
    topnav.classList.remove('is-searching');
    spBackdrop.classList.remove('is-on');
    spOpeners.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = '';
    setTimeout(() => { if (!spOpen) { sp.hidden = true; spBackdrop.hidden = true; } }, 360 * SLOW);
    if (restoreFocus && spOpener && spOpener.focus) spOpener.focus({ preventScroll: true });
  }

  function flash(el) {
    if (!el) return;
    el.classList.remove('search-hit');
    void el.offsetWidth;
    el.classList.add('search-hit');
    setTimeout(() => el.classList.remove('search-hit'), 2000);
  }

  function jumpTo(go) {
    let el = go.el || (go.sel && $(go.sel));
    if (go.stage) el = $(`[data-stage="${go.stage}"]`);
    if (go.caseIdx != null) el = $('.cases');
    if (go.snap != null) { el = $('.snap'); setSnap(go.snap); }
    if (!el) return;
    const behavior = RM ? 'auto' : 'smooth';
    const centre = go.stage || go.caseIdx != null || go.snap != null || go.row || go.el;
    el.scrollIntoView({ behavior, block: centre ? 'center' : 'start' });
    let done = false;
    const after = () => {
      if (done) return;
      done = true;
      if (go.stage && window.FoleyStages) window.FoleyStages.setActive(go.stage);
      if (go.caseIdx != null) { goCase(go.caseIdx); flash(cSlides[go.caseIdx]); }
      if (go.row) { el.classList.add('is-hover'); setTimeout(() => el.classList.remove('is-hover'), 2200); }
      if (go.el && !go.row) flash(el);
    };
    addEventListener('scrollend', after, { once: true });
    setTimeout(after, behavior === 'auto' ? 40 : 1000);
  }

  function choose(k) {
    const it = spShown[k];
    if (!it) return;
    closeSearch(false);
    requestAnimationFrame(() => jumpTo(it.go));
  }

  spOpeners.forEach((b) => b.addEventListener('click', () => (spOpen ? closeSearch() : openSearch(b))));
  spInput.addEventListener('input', renderSearch);
  spInput.addEventListener('keydown', (e) => {
    const n = spShown.length;
    if (e.key === 'ArrowDown' && n) { e.preventDefault(); setActive((spActive + 1) % n); }
    else if (e.key === 'ArrowUp' && n) { e.preventDefault(); setActive((spActive - 1 + n) % n); }
    else if (e.key === 'Home' && n && !spInput.value) { e.preventDefault(); setActive(0); }
    else if (e.key === 'Enter') { e.preventDefault(); if (spActive >= 0) choose(spActive); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeSearch(); }
  });
  spList.addEventListener('mousemove', (e) => { const o = e.target.closest('.sp-opt'); if (o && +o.dataset.k !== spActive) setActive(+o.dataset.k); });
  spList.addEventListener('click', (e) => { const o = e.target.closest('.sp-opt'); if (o) choose(+o.dataset.k); });
  spClear.addEventListener('click', () => { spInput.value = ''; renderSearch(); spInput.focus(); });
  $o('.sp-close', sp).addEventListener('click', () => closeSearch());
  $$('.sp-chip', sp).forEach((c) => c.addEventListener('click', () => { spInput.value = c.textContent; renderSearch(); spInput.focus(); }));
  $o('[data-sp-contact]', sp).addEventListener('click', (e) => { e.preventDefault(); closeSearch(false); jumpTo({ sel: '#contact', flash: false }); });
  spBackdrop.addEventListener('click', () => closeSearch());
  document.addEventListener('pointerdown', (e) => { if (spOpen && !e.target.closest('[data-search], [data-search-open]')) closeSearch(false); });
  sp.addEventListener('focusout', (e) => { if (spOpen && e.relatedTarget && !sp.contains(e.relatedTarget) && !spOpeners.includes(e.relatedTarget)) closeSearch(false); });
  addEventListener('scroll', () => { if (spOpen && innerWidth >= 960 && Math.abs(scrollY - spScrollY) > 80) closeSearch(false); }, { passive: true });
  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest('input, textarea, [contenteditable]');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); spOpen ? closeSearch() : openSearch(spOpeners[innerWidth < 960 ? 1 : 0]); }
    else if (e.key === '/' && !typing && !spOpen) { e.preventDefault(); openSearch(spOpeners[innerWidth < 960 ? 1 : 0]); }
  });

  /* ======================================================================
     Hero scenes: a 6x4 tile grid, every tile shows its slice of a scene
     ====================================================================== */
  const hero = $o('#hero');
  const grid = $o('[data-hero-grid]');
  const wordEl = $o('[data-hero-word]');

  // absolute URLs: the scenes go into CSS custom properties, and a relative url() there resolves
  // against the stylesheet that uses it (breaks once CSS is bundled elsewhere, e.g. the Storybook build)
  const abs = (p) => new URL(p, document.baseURI).href;
  const SCENES = [
    { id: 'hire',    word: 'Hire',    src: abs('assets/hero/scenes/hire.webp') },
    { id: 'onboard', word: 'Onboard', src: abs('assets/hero/scenes/onboard.webp') },
    { id: 'monitor', word: 'Monitor', src: abs('assets/hero/scenes/monitor.webp') },
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
    if (!present(hero)) return;
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

  /* Site / DS switch: ?ds=<url> points it at another Storybook host */
  const dsLink = $('[data-ds-link]');
  if (dsLink && params.get('ds')) dsLink.href = params.get('ds');

  // review modes that open UI on load run last, once every module is initialised
  if (params.get('menu') in panels) setMenu(params.get('menu'));
  if (params.has('search')) setTimeout(() => openSearch(spOpeners[0], params.get('search') || ''), 50);

  /* ?shot mirrors the Figma frame: first team row is shown hovered */
  if (SHOT) { const row = $('.team-row'); if (row) row.classList.add('is-hover'); }

  /* ---------- boot ---------- */
  initHero();
  frame();
})();
