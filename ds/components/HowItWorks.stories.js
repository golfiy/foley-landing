import { pick, wrap, live } from '../lib/site.js';

export default {
  title: 'Components/How It Works',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`how_it_works\` (+ frame “how_it_works hover states”). A \`--gradient-primary\` panel (40px padding) holding three **four_row_card** columns and the **Insights** band.

**Column (400×496, \`--color-stroke-primary\` border):** mark, \`type/h3\` title, \`type/body-m-medium\` subtitle in \`--color-text-tertiary\`, stage CTA, then a product illustration.
**Active (hover / focus / tap):** background \`--color-bg-secondary\`; the CTA morphs from a text link into a white button (padding + white plate scale in from 60%, arrow ink); the illustration drops out (180ms) and four links (\`type/body-l-medium\` + 24px arrow) stagger in (40ms) in the 299px bottom cell.
**Insights band:** connectors to the three columns, AI badge (rotates 90° when active), gradient title (\`--gradient-secondary\`), links + Get insights. Active deepens the band gradient (\`--gradient-tertiary-rest\` → \`--gradient-tertiary\`).

On first view the panel opens like a curtain and plays the hover states once (Hire → Onboard → Monitor → Insights), cancelled by any pointer or keyboard interaction. Below 960 columns stack and Insights always shows its links.` } } },
};

const panel = (activeAll) => {
  const p = pick('.stages-panel');
  if (activeAll) p.querySelectorAll('[data-stage]').forEach((s) => s.classList.add('is-active'));
  return wrap('ds-pad-sm', p);
};
const column = (name, active) => {
  const s = pick(`[data-stage="${name}"]`);
  if (active) s.classList.add('is-active');
  return s;
};

export const Default = { name: 'Panel: default', render: () => panel(false) };
export const HoverStates = { name: 'Panel: all hover states (Figma frame)', render: () => panel(true) };
export const Column = {
  name: 'Column: default vs active',
  render: () => wrap('ds-pad ds-dark', wrap('stage-row', column('onboard', false), column('onboard', true))),
};
export const Insights = {
  name: 'Insights: default vs active',
  render: () => { const a = pick('[data-stage="insights"]'); const b = pick('[data-stage="insights"]'); b.classList.add('is-active'); return wrap('ds-pad ds-dark ds-stack', a, b); },
};
export const Live = { name: 'Live (hover a column)', render: () => panel(false), parameters: live(980) };
