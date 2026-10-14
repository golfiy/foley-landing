import { pick, wrap, state } from '../lib/site.js';

export default {
  title: 'Components/Category Row',
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: `Figma **multiple_card** (Teams list). 24px category icon, \`type/h4\` title, \`type/body-m\` copy in \`--color-text-secondary\`, 24px arrow. 32/24 padding, min height 172px, \`--color-stroke-secondary\` dividers.

**Hover / focus:** a \`--color-bg-secondary\` fill wipes in from the left (700ms ease-out), copy turns \`--color-text-primary\`, only the arrow moves (6px). The icon stays put.` } } },
};

export const States = {
  render: () => {
    const make = (s) => { const r = pick('.team-row'); if (s === 'hover') r.classList.add('is-hover'); r.dataset.state = s; return state(s, wrap('teams-list', wrap('', r))); };
    return wrap('ds-row', make('default'), make('hover'));
  },
  parameters: { pseudo: { hover: ['[data-state="hover"]'] } },
};
export const Section = { name: 'In context (Teams)', render: () => wrap('', pick('.teams')) };
