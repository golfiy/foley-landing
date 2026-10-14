import { pick, wrap, live, click } from '../lib/site.js';

export default {
  title: 'Components/Mobile Drawer',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: `Below 960px the main bar keeps logo, Request a demo, a search icon and a burger (two 20px lines that cross into an X). The drawer fills the screen under the bar and locks page scroll. Sections are native \`<details>\` accordions (chevron rotates 180°), then Pricing and the two CTAs.

Not drawn in Figma: built in the same language (type/body-l-medium rows, \`--color-stroke-secondary\` dividers).` } },
  },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

const scene = () => wrap('', pick('header.topnav'), pick('.sp-backdrop'), pick('#drawer'), '<div style="height:900px;background:var(--gradient-primary)"></div>');

export const Closed = { render: scene, parameters: live(700) };
export const Open = {
  render: scene,
  parameters: live(800, (d) => { click(d, '[data-burger]'); const g = d.querySelector('.dr-group'); if (g) g.open = true; }),
};
