import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/Accordion',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`accordion\` (1243:14965). \`title_text\` (628: \`type/h2\` + \`type/subtitle\`), 48 below it a **522** list and a photo that fills the rest (40 gap, stretches to the list height, min 468).

**Item (filled):** \`bg/tertiary\`, padding 20 / 24, items 8 apart. Header \`type/h4\` + 24px plus icon, 24 apart; the whole strip is the hit area.
**Open:** \`bg/secondary\`, the icon turns into minus (vertical bar rotates away), the answer (\`type/body-l\`, \`text/secondary\`, 48 right padding) opens 16 under the header. One item open at a time; 450ms ease-out on grid rows.

Markup: \`h3 > button[aria-expanded][aria-controls]\` + \`div[role=region][aria-labelledby]\`; closed panels are \`inert\`. Interactive in the story.` } } },
};

export const Default = { name: 'accordion', render: () => wrap('ds-mod', mod('accordion')) };
