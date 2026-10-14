import { pick, wrap, live } from '../lib/site.js';

export default {
  title: 'Components/Top Navigation',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: `Two-tier header (Figma \`top navigation\` = \`info-banner\` + \`header\`).

- **Info bar** (33px): Search trigger and phone, right-aligned, \`type/body-s-medium\` in \`--color-text-tertiary\`. Scrolls away.
- **Main bar** (76px, 64px on mobile): logo, nav (40px gap), Log in (\`.btn-text\`) and Request a demo (\`.btn-teal.btn-head\`). Sticky; after 33px of scroll it gets \`--shadow-header\` (\`.is-stuck\`).
- Below 1140px the Log in link hides; below 960px nav and info bar hide, a search icon and burger appear (see Mobile Drawer).

**Behaviour (live story):** hover intent 120ms (60ms between triggers), click toggles, ↓ opens and focuses the first link, Esc closes and returns focus, click outside / scroll > 60px closes.` } },
  },
};

const header = (cls = '') => {
  const h = pick('header.topnav');
  if (cls) h.classList.add(...cls.split(' '));
  return wrap('ds-static-menu', h);
};

export const Default = { render: () => header() };
export const Stuck = { name: 'Stuck (after scroll)', render: () => header('is-stuck') };

export const Live = {
  name: 'Live (hover the menu)',
  render: () => wrap('', pick('header.topnav'), pick('.sp-backdrop'), pick('#drawer'), '<div style="height:900px;background:var(--gradient-primary)"></div>'),
  parameters: live(720),
};
