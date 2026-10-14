import { pick, wrap, live, click } from '../lib/site.js';

export default {
  title: 'Components/Mega Menu',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: `Figma \`navigation\` frames (products / solutions / resources / company). One 1280×470 stage under the main bar, white, \`--shadow-overlay\`.

**Anatomy:** columns (32px padding, \`--color-stroke-secondary\` dividers) → **column head** (title \`type/body-m-medium\` + description \`type/footnote\`, one link to the category page) → links (\`type/footnote-medium\`, 16px gap). A 282px **promo card** (\`--gradient-light\`, 196px photo, overline label, 20px title) and a 69px **footer row** of large arrow links.

**Motion:** opening drops a clip-path curtain (620ms ease-out), columns cascade in (+40ms each), the promo photo wipes down. Switching menus slides content 28px in the direction of travel; the old panel clears in 110ms before the new one arrives. Closing: 380ms ease-in.

**Column head hover:** title turns \`--color-text-secondary\` with a 1px underline, a 20px arrow slides in from -8px. It sits outside the text flow, so long titles never re-wrap.` } },
  },
};

const open = (name) => () => {
  const h = pick('header.topnav');
  h.classList.add('is-open');
  h.querySelector(`.nav-trigger[data-menu="${name}"]`).setAttribute('aria-expanded', 'true');
  h.querySelectorAll('.mm-panel').forEach((p) => { p.hidden = p.dataset.panel !== name; p.classList.toggle('is-active', p.dataset.panel === name); });
  return wrap('ds-static-menu', h, '<div style="height:24px"></div>');
};

export const Products = { render: open('products') };
export const Solutions = { render: open('solutions') };
export const Resources = { render: open('resources') };
export const Company = { render: open('company') };
export const ColumnHeadHover = {
  name: 'Column head: hover',
  render: open('products'),
  parameters: { pseudo: { hover: ['#mm-products .mm-col:first-child .mm-head'] } },
};
export const Live = {
  name: 'Live (opens Products)',
  render: () => wrap('', pick('header.topnav'), pick('.sp-backdrop'), pick('#drawer'), '<div style="height:900px;background:var(--gradient-primary)"></div>'),
  parameters: live(720, (d) => click(d, '[data-menu="products"]')),
};
