import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/Carousel',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`carousel\` (1243:14902). One photo, a list of topics and the copy for the selected one. Interactive in every story.

**Topic title (\`title_w_line\`):** 1px \`stroke/primary\` rule, title 4 below. The selected one adds a **108px \`text/primary\` segment** on the rule (draws in from the left).

**layout=vertical** (card like Callout: \`bg/tertiary\`, padding 40, brand mark): the 392 column lists the topics 24 apart in \`type/body-l\` \`text/tertiary\`. The open topic gets 16 above and below, its title becomes \`type/h3\` \`text/primary\`, and the body (\`type/body-m\`) and a **Primary** button slide open under it (grid-rows, 500ms ease-out). Behaves as an accordion that always keeps one topic open.

**layout=horizontal** (no card): a tab row of five equal tabs (\`type/body-m\`, tertiary → primary when selected), 40 above the photo + 392 copy column (\`type/h3\`, body, button, 40 bottom padding). Prev / next arrows (24px in a 32 tap zone, 8 apart) sit at the bottom of the copy column and wrap around. ARIA tabs: ←/→, Home / End. The copy fades and slides 12px on change.

**image right** mirrors both layouts. Below 960 everything stacks and the tab row scrolls sideways.

Note: in Figma the open topic in the vertical layout is titled “Drug & Alcohol Testing” twice; the module uses the horizontal set (“Background Checks” open).` } } },
};

const block = (key) => ({ render: () => wrap('ds-mod', mod(key)) });
export const VerticalImageLeft = { name: 'layout=vertical, view=image left', ...block('carousel-vertical-left') };
export const VerticalImageRight = { name: 'layout=vertical, view=image right', ...block('carousel-vertical-right') };
export const HorizontalImageLeft = { name: 'layout=horizontal, view=image left', ...block('carousel-horizontal-left') };
export const HorizontalImageRight = { name: 'layout=horizontal, view=image right', ...block('carousel-horizontal-right') };
