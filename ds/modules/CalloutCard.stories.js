import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/Callout Card',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`callout_card\` (1243:14783). A **1280** card in the content column: padding 40, gap 40. The photo fills the remaining width (min height 468, cover); the copy column is **392**.

**Copy:** \`type/h3\` title (32/1.1) and \`type/body-m\` text (18/1.2, paragraphs 8 apart) 24 apart, button 48 below.
**Light:** \`bg/tertiary\`, 12px brand mark at 8/8, title \`text/primary\`, text \`text/secondary\`, **Primary** button.
**Dark:** \`linear/primary\`, no mark, white text, **White** button.
**image right:** the same card mirrored (\`.m-split--image-right\`).

Below 1280 the copy column narrows to 360; below 960 the card stacks (photo 280 on top, padding 24).` } } },
};

const card = (key) => ({ render: () => wrap('ds-mod', mod(key)) });
export const LightImageLeft = { name: 'view=light image left', ...card('callout-light-left') };
export const LightImageRight = { name: 'view=light image right', ...card('callout-light-right') };
export const DarkImageLeft = { name: 'view=dark image left', ...card('callout-dark-left') };
export const DarkImageRight = { name: 'view=dark image right', ...card('callout-dark-right') };
