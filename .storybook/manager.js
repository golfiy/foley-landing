import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Foley · Design System',
    brandUrl: 'http://127.0.0.1:4965/',
    brandTarget: '_self',
    colorPrimary: '#294C5A',
    colorSecondary: '#1A3946',
    appBg: '#F8F9FC',
    appContentBg: '#FFFFFF',
    appBorderColor: '#E1EAFA',
    textColor: '#111117',
    textMutedColor: '#70707D',
    barBg: '#FFFFFF',
    fontBase: '"Inter Display", Inter, system-ui, sans-serif',
  }),
  sidebar: { showRoots: true },
});

/* Site / DS switch, mirrors the one on the landing (bottom-left).
   Docked as a footer strip of the sidebar so it never covers tree items. */
const SITE_URL = 'http://127.0.0.1:4965/';
window.addEventListener('DOMContentLoaded', () => {
  const dock = document.createElement('div');
  dock.className = 'foley-ds-dock';
  dock.innerHTML = `<nav class="foley-ds-switch" aria-label="Site or design system"><a href="${SITE_URL}">Site</a><a href="./" aria-current="page">DS</a></nav>`;
  document.body.append(dock);

  let side = null;
  const sync = () => {
    const w = side ? side.getBoundingClientRect().width : 0;
    const docked = w > 160 && innerWidth >= 600;
    dock.classList.toggle('is-docked', docked);
    dock.style.width = docked ? `${w}px` : '';
  };
  const ro = new ResizeObserver(sync);
  const find = () => {
    const el = document.getElementById('storybook-sidebar-region');
    if (el && el !== side) { if (side) ro.unobserve(side); side = el; ro.observe(el); }
    sync();
  };
  new MutationObserver(find).observe(document.body, { childList: true, subtree: true });
  addEventListener('resize', sync);
  find();
});
