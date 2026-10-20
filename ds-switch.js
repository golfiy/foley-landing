/*
 * Site / DS switch: one segmented control shared by the landing (fixed, bottom-left)
 * and the Storybook manager (docked in the side nav footer). Review tool, not a site component.
 *
 * - a white thumb slides to the chosen half, then the page changes (360ms, instant with reduced motion)
 * - on arrival the thumb starts on the side you came from (document.referrer) and slides home
 * - links carry data-ds-hosted: the relative path used outside the dev servers (Pages / dist: site at /, Storybook at /storybook/)
 * - Back from the other page (bfcache) slides the thumb back to the current side
 * Values are Foley tokens written out, because the Storybook manager has no tokens.css.
 */
(() => {
  const CSS = `
.ds-switch {
  position: fixed; left: 16px; bottom: 16px; z-index: 89;
  display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border-radius: 999px;
  isolation: isolate; user-select: none; -webkit-user-select: none;
  background: #0A171C;                                    /* color/bg/inverse */
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .06), 0 10px 30px -10px rgba(10, 23, 28, .55);
  font: 500 13px/1 "Inter Display", Inter, system-ui, sans-serif; letter-spacing: 0;
}
.ds-switch-thumb {
  position: absolute; z-index: -1; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px);
  border-radius: 999px; background: #fff;                 /* color/bg/light */
  box-shadow: 0 1px 2px rgba(10, 23, 28, .3);
  transition: transform .44s cubic-bezier(.16, 1, .3, 1), scale .2s cubic-bezier(.4, 0, .2, 1); /* motion/easing/out, standard */
}
.ds-switch[data-pos="1"] .ds-switch-thumb { transform: translateX(100%); }
.ds-switch:has(a:active) .ds-switch-thumb { scale: .96; }
.ds-switch a {
  display: grid; place-items: center; min-width: 52px; height: 28px; padding: 0 14px; border-radius: 999px;
  color: rgba(255, 255, 255, .6); text-decoration: none;
  transition: color .3s cubic-bezier(.4, 0, .2, 1);       /* motion/easing/standard */
}
.ds-switch a:hover { color: #fff; }
.ds-switch[data-pos="0"] a:nth-of-type(1),
.ds-switch[data-pos="1"] a:nth-of-type(2) { color: #111117; } /* color/text/primary */
.ds-switch a:focus-visible { outline: 2px solid #81E014; outline-offset: 1px; } /* color/brand/primary */
.ds-switch.is-instant .ds-switch-thumb, .ds-switch.is-instant a { transition: none; }
@media (prefers-reduced-motion: reduce) { .ds-switch-thumb, .ds-switch a { transition: none; } }
.shot .ds-switch { display: none; }
`;
  const LEAVE_MS = 360;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // dev servers: site on :4965, Storybook on :4967. Anything else (GitHub Pages, a served dist/) uses the hosted layout
  const LOCAL = ['4965', '4967'].includes(location.port);
  const base = (href) => { try { const u = new URL(href, location.href); return u.origin + u.pathname; } catch { return ''; } };

  function mount(nav) {
    if (!nav || nav.dataset.mounted) return;
    nav.dataset.mounted = '1';
    if (!document.getElementById('ds-switch-css')) {
      const st = document.createElement('style');
      st.id = 'ds-switch-css';
      st.textContent = CSS;
      document.head.append(st);
    }
    const links = [...nav.querySelectorAll('a')];
    if (!LOCAL) links.forEach((a) => { if (a.dataset.dsHosted) a.setAttribute('href', a.dataset.dsHosted); });
    const cur = Math.max(0, links.findIndex((a) => a.getAttribute('aria-current') === 'page'));
    const thumb = document.createElement('span');
    thumb.className = 'ds-switch-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    nav.prepend(thumb);

    const slideHome = (fromPos) => {
      nav.classList.add('is-instant');
      nav.dataset.pos = fromPos;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        nav.classList.remove('is-instant');
        nav.dataset.pos = cur;
      }));
    };
    // which side did we come from: the link whose URL is the longest prefix of the referrer
    const ref = document.referrer;
    let from = -1, best = 0;
    if (ref) links.forEach((a, i) => { const b = base(a.href); if (b && ref.startsWith(b) && b.length > best) { best = b.length; from = i; } });
    slideHome(from >= 0 ? from : cur);
    addEventListener('pageshow', (e) => { if (e.persisted) slideHome(Number(nav.dataset.pos) || 0); });

    links.forEach((a, i) => a.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      nav.dataset.pos = i;
      if (i === cur) return;
      setTimeout(() => { location.href = a.href; }, reduced() ? 0 : LEAVE_MS);
    }));
  }

  window.FoleyDsSwitch = { mount };
  const boot = () => document.querySelectorAll('.ds-switch').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
