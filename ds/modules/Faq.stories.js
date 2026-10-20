import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/FAQ',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`faq\` (1243:14977). Both use the **Accordion** item; interactive in the stories.

**horizontal_faq:** \`title_text\` (628) on the left, the list (filled items, 8 apart) on the right, 80 between.
**Topic menu (option, \`menu\` control):** 305 wide, starts **386 from the top** (as in Figma) and stays there whatever opens in the list; the left column is sticky, so the menu stays in view next to a long list. \`type/h4\` topics 24 apart in \`text/tertiary\`; the selected one is \`text/primary\` with the 12px brand mark in front. Clicking a topic filters the list (\`data-topics\` on items; the mapping is placeholder until real questions exist). Without the menu the left column is just the title.

**vertical_faq:** \`title_text\`, then 80 below an **847** list of lined items: 1px \`stroke/primary\` rule on top, padding 16, no fill. The open answer can hold rich text (paragraphs and a bulleted list, blank line between blocks).` } } },
};

/** horizontal_faq with the topic menu as an option (Controls → menu) */
export const Horizontal = {
  name: 'horizontal_faq',
  args: { menu: true },
  argTypes: { menu: { control: 'boolean', description: 'Show the topic menu under the title' } },
  render: ({ menu }) => wrap('ds-mod', mod(menu ? 'faq-horizontal' : 'faq-horizontal-plain')),
};
export const HorizontalNoMenu = { name: 'horizontal_faq, no menu', render: () => wrap('ds-mod', mod('faq-horizontal-plain')) };
export const Vertical = { name: 'vertical_faq', render: () => wrap('ds-mod', mod('faq-vertical')) };
