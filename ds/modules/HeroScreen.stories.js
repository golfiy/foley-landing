import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/Hero Screen',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`hero\` (modules, 1243:14730). Page-top module for inner pages, **1440 × 627**, capped at 1440 and centred on wider screens. Copy is the Figma placeholder copy.

**Copy column (692, padding 80):** \`type/h1\` title (60/64, −1.2) + \`type/body-l\` subtitle (496 wide), 24 apart; button 32 below. Light views: title \`text/primary\`, subtitle \`text/secondary\`, **Primary** button. Dark views: white text, **White** button.

| view | Background | Right side (x 692 → 1444) |
|---|---|---|
| main | – | the homepage hero, see **Components / Hero** |
| light bg | \`bg/tertiary\` | \`linear/primary\` panel, box pattern (568×750) and the product shot in a frosted frame (532×432, white 48%, blur 14.7, radius 14.7) |
| light image | \`bg/tertiary\` | photo, cover |
| dark image | \`linear/primary\` | photo, cover |
| dark boxed | \`linear/primary\` | box pattern turned on its side across the frame, densest bottom-right |
| dark pattern | facet image, cover | none |

Below 960 the copy stacks on top of the media (340px, 380 for light bg); the title scales from 52 to 36.` } } },
};

const hero = (key) => ({ render: () => wrap('ds-mod-flush', mod(key)) });
export const LightBg = { name: 'view=light bg', ...hero('hero-light-bg') };
export const LightImage = { name: 'view=light image', ...hero('hero-light-image') };
export const DarkImage = { name: 'view=dark image', ...hero('hero-dark-image') };
export const DarkBoxed = { name: 'view=dark boxed', ...hero('hero-dark-boxed') };
export const DarkPattern = { name: 'view=dark pattern', ...hero('hero-dark-pattern') };
