import { pick, wrap, state } from '../lib/site.js';

export default {
  title: 'Components/Link',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: `Text links. All use \`type/button\` (18/20 SemiBold) in \`--color-text-secondary\`.

| Link | Class | Hover |
|---|---|---|
| Arrow link | \`.link-arrow\` | arrow moves 4px right |
| Arrow link, large | \`.link-arrow.link-arrow-lg\` | same, 12px vertical padding (mega menu footer) |
| Stage CTA | \`.stage-cta\` | text link that morphs into a white button when its column is active |
| Nav link | \`.nav-link\`, \`.nav-trigger\` | 1px underline grows from the left; triggers rotate the chevron when open |
| Menu link | \`.mm-links a\` | underline grows, colour to text/secondary, 2px nudge |
| Column head | \`.mm-head\` | title underline + arrow slides in (8px, 450ms ease-out) |` } },
  },
};

const S = { hover: ['[data-state="hover"]'], focusVisible: ['[data-state="focus"]'] };
const trio = (make) => wrap('ds-row', ['default', 'hover', 'focus'].map((s) => { const n = make(); n.dataset.state = s; return state(s, n); }));

export const ArrowLink = { render: () => trio(() => pick('.faq-card .link-arrow')), parameters: { pseudo: S } };
export const ArrowLinkLarge = { name: 'Arrow link, large', render: () => trio(() => pick('.mm-foot .link-arrow')), parameters: { pseudo: S } };
export const NavItems = {
  name: 'Nav trigger & link',
  render: () => {
    const hover = pick('.nav-trigger'); hover.dataset.state = 'hover';
    const open = pick('.nav-trigger'); open.setAttribute('aria-expanded', 'true');
    return wrap('ds-row', state('default', pick('.nav-trigger')), state('hover', hover), state('open', open), state('link', pick('.nav-link')));
  },
  parameters: { pseudo: { hover: ['[data-state="hover"]'] } },
};
export const ColumnHead = {
  name: 'Mega menu column head',
  render: () => wrap('ds-row', ['default', 'hover', 'focus'].map((s) => { const n = pick('.mm-head'); n.dataset.state = s; return state(s, wrap('mm-col', n)); })),
  parameters: { pseudo: S },
};
