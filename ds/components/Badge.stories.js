import { pick, wrap, state } from '../lib/site.js';

export default {
  title: 'Components/Badge & Mark',
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: `Small markers.

- **Mark** (\`.mark\`, Figma \`rect_badge\`): 12×12 \`--color-brand-primary\`, sits 8px from the top-left corner of cards and columns. Static, never animates.
- **Overline** (\`.overline\`): \`type/overline\`, uppercase, \`--color-text-tertiary\`. Eyebrows and industry tags.
- **Badge** (\`.badge\`): pill with \`--gradient-secondary\`, white 14px text. Used for “TBD”.
- **Kbd** (\`kbd\`): keyboard hint in the search panel and header.` } } },
};

export const Mark = { render: () => wrap('ds-row', state('mark', pick('.trio-card .mark'))) };
export const Overline = { render: () => wrap('ds-row', state('overline', pick('.trio-card .overline')), state('case tag', pick('.case .overline'))) };
export const Badge = { render: () => wrap('ds-row', state('badge', pick('.insights .soon'))) };
export const Kbd = { render: () => wrap('ds-row', state('kbd', pick('.sp-foot'))) };
