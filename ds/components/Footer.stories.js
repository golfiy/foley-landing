import { pick } from '../lib/site.js';

export default {
  title: 'Components/Footer',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`footer\`. Top row: three short columns + Log in / Request a demo. Main: four stacks of link groups (197px columns, 20px gap, \`type/footnote-medium\`; headings in \`--color-text-tertiary\`), brand block on the right (logo, address, phone), BBB and PBSA badges bottom-right. Rule in \`--color-stroke-primary\`, then legal row (\`type/footnote\`) and 24px social icons with 40px gaps.

Hover: link underline grows from the left; social icons lift 3px. Below 960 the stacks form a two-column grid and the brand block moves under them.` } } },
};

export const Default = { render: () => pick('footer.footer') };
