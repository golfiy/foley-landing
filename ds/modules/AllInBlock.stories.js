import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/All-in Block',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`all_in_block\` (1243:14828). The **Callout Card** layout (1280, padding 40, photo + 392 copy column) with a check list under the text.

**Check list:** 16px above, rows 16 apart; a 24px \`ico/check\` tile (\`bg/secondary\` with a \`text/tertiary\` tick on light, \`bg/primary\` with a white tick on dark) and \`type/body-s\` text 16 to the right (\`text/secondary\` on light, white on dark).
**Button:** **Primary** on both light and dark (Figma keeps the teal button on the dark card).
**Light:** \`bg/tertiary\` + brand mark · **Dark:** \`linear/primary\`, no mark.` } } },
};

const card = (key) => ({ render: () => wrap('ds-mod', mod(key)) });
export const LightImageLeft = { name: 'view=light image left', ...card('allin-light-left') };
export const LightImageRight = { name: 'view=light image right', ...card('allin-light-right') };
export const DarkImageLeft = { name: 'view=dark image left', ...card('allin-dark-left') };
export const DarkImageRight = { name: 'view=dark image right', ...card('allin-dark-right') };
