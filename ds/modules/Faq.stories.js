import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/FAQ',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`faq\` (1243:14977). Both use the **Accordion** item; interactive in the stories.

**horizontal_faq:** \`title_text\` (628) on the left, the list (filled items, 8 apart) on the right, 80 between. The optional **topic menu** (305) sits at the bottom of the left column: \`type/h4\` topics 24 apart in \`text/tertiary\`; the selected one is \`text/primary\` with the 12px brand mark in front. Clicking a topic filters the list (\`data-topics\` on items; the mapping is placeholder until real questions exist).

**vertical_faq:** \`title_text\`, then 80 below an **847** list of lined items: 1px \`stroke/primary\` rule on top, padding 16, no fill. The open answer can hold rich text (paragraphs and a bulleted list, blank line between blocks).` } } },
};

export const Horizontal = { name: 'horizontal_faq (with topic menu)', render: () => wrap('ds-mod', mod('faq-horizontal')) };
export const Vertical = { name: 'vertical_faq', render: () => wrap('ds-mod', mod('faq-vertical')) };
