import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/Tiles Row',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`tiles_row\` (1243:14816). Four \`tiles_card\`s, **314 wide, 8 apart**, in the 1280 column.

**Card:** \`bg/tertiary\`, padding 32 / 32 / 16, brand mark at 8/8. \`type/h4\` title (24/1.1, −1) and \`type/body-m\` text in \`text/secondary\` 24 apart; the **Learn more** text link sits at the bottom (space-between). Height 392.
**With image:** a 208px photo across the top (cover), copy starts at 232, no mark. Height 580.

No hover on the card itself; only the link arrow moves (same rule as the homepage text cards). Two columns below 1140, one below 600.` } } },
};

export const TilesRow = { name: 'tiles_row', render: () => wrap('ds-mod', mod('tiles-row')) };
export const TilesRowWithImage = { name: 'tiles_row_w_image', render: () => wrap('ds-mod', mod('tiles-row-image')) };
