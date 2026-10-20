/*
 * Foley page modules: behaviour for modules.html and the design system.
 * Each widget binds to its own element, so init() is safe to call again on new markup
 * (Storybook renders a fresh story into the same document).
 *
 *   [data-acc]   accordion: one open item, header button toggles, grid-rows animation
 *   [data-car]   carousel, vertical (.m-vcar) or horizontal (.m-hcar): autoplay with a progress line,
 *                photo wipe per topic, pause on hover / focus / off-screen (Foley services motion)
 *   [data-faq]   FAQ topic menu: filters the list by data-topics
 *   [data-form]  contact form: required + email check, inline errors, status note
 */
(() => {
  const SHOT = /[?&]shot\b/.test(location.search);
  if (SHOT) document.documentElement.classList.add('shot');
  const bound = new WeakSet();
  let uid = 0;
  const id = (p) => `${p}-${++uid}`;

  /* ---------- accordion ---------- */
  function setOpen(item, open) {
    item.classList.toggle('is-open', open);
    const btn = item.querySelector('.m-acc-btn');
    const panel = item.querySelector('.m-acc-panel');
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (panel) panel.inert = !open;
  }
  function accordion(list) {
    const items = [...list.querySelectorAll(':scope > .m-acc-item')];
    items.forEach((item) => {
      const btn = item.querySelector('.m-acc-btn');
      const panel = item.querySelector('.m-acc-panel');
      btn.id = id('macc-b');
      panel.id = id('macc-p');
      btn.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', btn.id);
      setOpen(item, item.classList.contains('is-open'));
      btn.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach((i) => { if (i !== item) setOpen(i, false); });
        setOpen(item, open);
      });
    });
  }

  /* ---------- carousel (vertical + horizontal), motion as in the Foley services section ----------
     Autoplay: the active topic's line fills over --motion-duration-dwell; on animationend the next
     topic opens. Pauses: hover on the titles / copy, keyboard focus, off-screen, hidden tab.
     Vertical: picking a topic stops autoplay until the cursor leaves the list, focus leaves the
     carousel or it scrolls away; then it carries on from the picked topic.
     Horizontal: a mouse click just switches; a tap on touch stops autoplay. */
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastPointer = 'mouse';
  document.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType || 'mouse'; }, true);

  function carousel(root) {
    const vertical = root.classList.contains('m-vcar');
    const triggers = vertical ? [...root.querySelectorAll('.m-vcar-tab')] : [...root.querySelectorAll('.m-hcar-tab')];
    const items = vertical ? [...root.querySelectorAll('.m-vcar-item')] : triggers;
    const panels = vertical ? [...root.querySelectorAll('.m-vcar-panel')] : [...root.querySelectorAll('.m-hcar-panel')];
    const photos = [...root.querySelectorAll('.m-car-ph')];
    const n = items.length;
    const autoplay = !SHOT && !REDUCED();
    const pauses = new Set();
    let index = -1;
    let stopped = false;
    let cleanup = 0;
    let leave = 0;

    // ARIA wiring
    triggers.forEach((t, k) => {
      t.id = id(vertical ? 'mvc-t' : 'mhc-t');
      panels[k].id = id(vertical ? 'mvc-p' : 'mhc-p');
      t.setAttribute('aria-controls', panels[k].id);
      panels[k].setAttribute('aria-labelledby', t.id);
      if (vertical) panels[k].setAttribute('role', 'region');
    });

    const running = () => autoplay && !stopped;
    const syncRun = () => root.classList.toggle('is-running', running());
    const syncPause = () => root.classList.toggle('is-paused', pauses.size > 0);
    const stop = () => { if (!stopped) { stopped = true; syncRun(); } };
    const resume = () => { if (stopped && vertical) { stopped = false; syncRun(); } };

    function activate(next, prev, instant) {
      if (vertical) {
        items.forEach((it, k) => {
          const on = k === next;
          it.classList.toggle('is-open', on);
          triggers[k].setAttribute('aria-expanded', String(on));
          panels[k].inert = !on;
        });
        return;
      }
      triggers.forEach((t, k) => {
        const on = k === next;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      clearTimeout(leave);
      panels.forEach((p) => p.classList.remove('is-leaving'));
      if (prev >= 0 && !instant) {
        panels[prev].classList.add('is-leaving');
        leave = setTimeout(() => panels[prev].classList.remove('is-leaving'), 320);
      }
      panels.forEach((p, k) => { p.classList.toggle('is-active', k === next); p.inert = k !== next; });
      // mobile: the tab strip scrolls; keep the active tab in view (the strip only, never the page)
      const strip = triggers[next].parentElement;
      if (strip.scrollWidth > strip.clientWidth + 1) {
        const t = triggers[next].getBoundingClientRect(), s = strip.getBoundingClientRect();
        strip.scrollTo({ left: strip.scrollLeft + (t.left - s.left) - (s.width - t.width) / 2, behavior: instant || REDUCED() ? 'auto' : 'smooth' });
      }
    }

    function go(next, { dir, instant = false } = {}) {
      next = (next + n) % n;
      if (next === index) return;
      const prev = index;
      index = next;
      const forward = dir ? dir === 'next' : next > prev;
      root.dataset.dir = forward ? 'next' : 'prev';
      activate(next, prev, instant);

      clearTimeout(cleanup);
      photos.forEach((p) => p.classList.remove('is-prev', 'is-entering'));
      if (prev < 0 || instant) { photos.forEach((p, k) => p.classList.toggle('is-active', k === next)); return; }
      const out = photos[prev];
      const inc = photos[next];
      out.classList.remove('is-active');
      out.classList.add('is-prev');
      inc.dataset.from = vertical ? (forward ? 'below' : 'above') : (forward ? 'right' : 'left');
      inc.classList.add('is-entering', 'is-active');
      void inc.offsetWidth;                               // commit the start state, then let it transition
      inc.classList.remove('is-entering');
      cleanup = setTimeout(() => out.classList.remove('is-prev'), 1100);
    }

    root.addEventListener('animationend', (e) => {
      if (e.animationName !== 'm-car-progress' || !running()) return;
      go(index + 1, { dir: 'next' });
    });

    triggers.forEach((t, k) => t.addEventListener('click', () => {
      if (vertical || lastPointer === 'touch') stop();
      go(k);
    }));
    triggers.forEach((t, k) => t.addEventListener('keydown', (e) => {
      const map = vertical
        ? { ArrowDown: k + 1, ArrowUp: k - 1, Home: 0, End: n - 1 }
        : { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: n - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      const target = (map[e.key] + n) % n;
      triggers[target].focus();
      if (vertical) stop();
      go(target, { dir: ['ArrowDown', 'ArrowRight', 'End'].includes(e.key) ? 'next' : 'prev' });
    }));
    root.querySelectorAll('[data-car-step]').forEach((a) => a.addEventListener('click', () => {
      const step = parseInt(a.dataset.carStep, 10);
      go(index + step, { dir: step > 0 ? 'next' : 'prev' });
    }));

    // hover on the reading / choosing zone holds the topic; the photo does not
    const zones = vertical ? [root.querySelector('.m-vcar-list')] : [root.querySelector('.m-hcar-tabs'), root.querySelector('.m-hcar-text')];
    const hovered = new Set();
    const syncHover = () => {
      if (hovered.size) pauses.add('hover'); else pauses.delete('hover');
      if (vertical) root.classList.toggle('is-hovering', hovered.size > 0);
      if (!hovered.size) resume();
      syncPause();
    };
    zones.forEach((z) => {
      if (!z) return;
      z.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { hovered.add(z); syncHover(); } });
      z.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { hovered.delete(z); syncHover(); } });
    });
    root.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) { pauses.add('focus'); syncPause(); } });
    root.addEventListener('focusout', (e) => {
      if (root.contains(e.relatedTarget)) return;
      pauses.delete('focus');
      resume();
      syncPause();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) pauses.delete('offscreen'); else { pauses.add('offscreen'); resume(); }
        syncPause();
      }, { threshold: 0.25 }).observe(root);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauses.add('hidden'); else pauses.delete('hidden');
      syncPause();
    });

    const start = Math.max(0, vertical ? items.findIndex((i) => i.classList.contains('is-open')) : items.findIndex((t) => t.classList.contains('is-active')));
    go(start, { instant: true });
    syncRun();
  }

  /* ---------- FAQ topic menu ---------- */
  function faq(root) {
    const topics = [...root.querySelectorAll('.m-faq-topic')];
    const items = [...root.querySelectorAll('.m-acc-item')];
    topics.forEach((btn) => btn.addEventListener('click', () => {
      const t = btn.dataset.topic;
      topics.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      items.forEach((item) => {
        const show = t === 'all' || (item.dataset.topics || '').split(/\s+/).includes(t);
        item.hidden = !show;
        if (!show) setOpen(item, false);
      });
    }));
  }

  /* ---------- contact form ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldError(input, msg) {
    const field = input.closest('.m-field');
    let err = field.querySelector('.m-field-err');
    if (!msg) {
      input.removeAttribute('aria-invalid');
      if (err) err.remove();
      input.removeAttribute('aria-describedby');
      return;
    }
    if (!err) {
      err = document.createElement('span');
      err.className = 'm-field-err';
      err.id = id('mf-e');
      field.append(err);
    }
    err.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', err.id);
  }
  function form(el) {
    const note = el.querySelector('.m-form-note');
    el.addEventListener('input', (e) => {
      if (e.target.matches('.m-input[aria-invalid]')) fieldError(e.target, '');
      if (note) note.textContent = '';
    });
    el.addEventListener('submit', (e) => {
      e.preventDefault();
      let first = null;
      el.querySelectorAll('.m-input').forEach((input) => {
        const v = input.value.trim();
        let msg = '';
        if (input.required && !v) msg = `Enter your ${(input.placeholder || 'value').toLowerCase()}`;
        else if (input.type === 'email' && v && !EMAIL.test(v)) msg = 'Enter a valid email';
        fieldError(input, msg);
        if (msg && !first) first = input;
      });
      if (first) { first.focus(); if (note) note.textContent = ''; return; }
      if (note) note.textContent = 'Thanks. A Foley expert will be in touch shortly.';
    });
  }

  function init(root = document) {
    const each = (sel, fn) => root.querySelectorAll(sel).forEach((el) => { if (!bound.has(el)) { bound.add(el); fn(el); } });
    each('[data-acc]', accordion);
    each('[data-car]', carousel);
    each('[data-faq]', faq);
    each('[data-form]', form);
  }

  window.FoleyModules = { init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
