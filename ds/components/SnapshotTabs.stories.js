import { pick, wrap, live } from '../lib/site.js';

export default {
  title: 'Components/Snapshot Tabs',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`onboarding\` container: a 433px vertical tab list (**silent_card**) next to a \`--gradient-primary\` stage (64px padding) with one product screenshot.

**Tab:** \`type/h4\` title (single line, ellipsis) + \`type/body-m\` copy; rest \`--color-bg-tertiary\` with \`--color-text-secondary\` copy, hover \`--color-bg-tertiary-hover\`, selected \`--color-bg-secondary\` with \`--color-text-primary\` copy. Dividers \`--color-stroke-secondary\`.
**Behaviour:** each tab moves a “camera” over the same screenshot (translate + scale, 1100ms ease-out). Rotates every 6s while visible, pauses on hover / focus. ↑/↓ move between tabs (tablist, vertical).` } } },
};

const block = () => wrap('ds-pad', pick('.snap'));
export const Default = { render: block };
export const SecondTab = {
  name: 'Second tab selected',
  render: () => { const s = pick('.snap'); s.querySelectorAll('.snap-item').forEach((b, i) => { b.classList.toggle('is-active', i === 1); b.setAttribute('aria-selected', String(i === 1)); }); return wrap('ds-pad', s); },
};
export const Live = { render: block, parameters: live(800) };
