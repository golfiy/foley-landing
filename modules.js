/*
 * Foley page modules: behaviour for modules.html and the design system.
 * Each widget binds to its own element, so init() is safe to call again on new markup
 * (Storybook renders a fresh story into the same document).
 *
 *   [data-acc]   accordion: one open item, header button toggles, grid-rows animation
 *   [data-vcar]  vertical carousel: one title always open, others collapse
 *   [data-hcar]  horizontal carousel: ARIA tabs + prev / next arrows (wraps around)
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

  /* ---------- vertical carousel ---------- */
  function vcar(root) {
    const items = [...root.querySelectorAll('.m-vcar-item')];
    const select = (item) => items.forEach((i) => {
      const on = i === item;
      i.classList.toggle('is-open', on);
      const tab = i.querySelector('.m-vcar-tab');
      tab.setAttribute('aria-expanded', String(on));
      i.querySelector('.m-vcar-panel').inert = !on;
    });
    items.forEach((item) => {
      const tab = item.querySelector('.m-vcar-tab');
      const panel = item.querySelector('.m-vcar-panel');
      tab.id = id('mvc-t');
      panel.id = id('mvc-p');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', () => { if (!item.classList.contains('is-open')) select(item); });
    });
    select(items.find((i) => i.classList.contains('is-open')) || items[0]);
  }

  /* ---------- horizontal carousel (tabs) ---------- */
  function hcar(root) {
    const tabs = [...root.querySelectorAll('.m-hcar-tab')];
    const panel = root.querySelector('.m-hcar-body');
    const text = root.querySelector('.m-hcar-text');
    const title = root.querySelector('[data-hcar-title]');
    panel.id = id('mhc-p');
    tabs.forEach((t) => { t.id = id('mhc-t'); t.setAttribute('aria-controls', panel.id); });
    let cur = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    let timer = 0;
    const render = (i, focus) => {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === cur)); t.tabIndex = k === cur ? 0 : -1; });
      panel.setAttribute('aria-labelledby', tabs[cur].id);
      if (focus) tabs[cur].focus();
      const swap = () => { if (title) title.textContent = tabs[cur].textContent; text.classList.remove('is-swap'); };
      if (SHOT || matchMedia('(prefers-reduced-motion: reduce)').matches) { swap(); return; }
      clearTimeout(timer);
      text.classList.add('is-swap');
      timer = setTimeout(swap, 160);
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => render(k)));
    root.querySelector('.m-hcar-tabs').addEventListener('keydown', (e) => {
      const map = { ArrowRight: 1, ArrowLeft: -1 };
      if (e.key in map) { e.preventDefault(); render(cur + map[e.key], true); }
      else if (e.key === 'Home') { e.preventDefault(); render(0, true); }
      else if (e.key === 'End') { e.preventDefault(); render(tabs.length - 1, true); }
    });
    root.querySelector('[data-hcar-prev]')?.addEventListener('click', () => render(cur - 1));
    root.querySelector('[data-hcar-next]')?.addEventListener('click', () => render(cur + 1));
    tabs.forEach((t, k) => { t.tabIndex = k === cur ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tabs[cur].id);
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
    each('[data-vcar]', vcar);
    each('[data-hcar]', hcar);
    each('[data-faq]', faq);
    each('[data-form]', form);
  }

  window.FoleyModules = { init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
