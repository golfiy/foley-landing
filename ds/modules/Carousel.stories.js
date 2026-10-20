import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/Carousel',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`carousel\` (1243:14902). One photo, a list of topics and the copy for the selected one. Interactive in every story.

**Topic title (\`title_w_line\`):** 1px \`stroke/primary\` rule, title 4 below.

**Motion (same logic as the Foley services section):**
- **Autoplay:** one topic per \`motion/duration/dwell\` (8s). A 2px \`text/primary\` line fills the active topic's rule (horizontal: the active tab's slot); when it is full the next topic opens. Loops.
- **Photo per topic:** the new photo wipes in from the direction of travel (vertical: from below / above; horizontal: from the right / left; \`motion/duration/wipe\` 1000ms, \`motion/easing/wipe\`) while zooming out from 112%, then pushes in slowly (100 → 105%) while it is on screen.
- **Pause:** cursor on the titles / copy (not the photo), keyboard focus inside, the carousel less than 25% on screen, hidden tab. It carries on from the same point. Vertical: the running line fades out while the cursor is on the list.
- **Picking a topic:** vertical: a click stops autoplay until the cursor leaves the list, focus leaves or the carousel scrolls away, then it carries on from the picked topic. Horizontal: a mouse click just switches (autoplay goes on), a tap on touch stops it. Arrows step and wrap.
- **No autoplay** (\`prefers-reduced-motion\`, \`?shot\`, stopped): the Figma marker shows instead: a **108px \`text/primary\` segment** on the selected rule, drawing in from the left. Reduced motion also turns wipes into cross-fades.

**layout=vertical** (card like Callout: \`bg/tertiary\`, padding 40, brand mark): the 392 column lists the topics 24 apart. Titles are laid out at \`type/h3\` and scaled to the closed \`type/body-l\` size (\`text/tertiary\`), so opening is a transform; the open topic gets 16 above and below, and its body (\`type/body-m\`) and **Primary** button rise in after the height opens (\`motion/duration/swap\` 640ms, \`motion/easing/in-out\`, 200ms lead, 70ms stagger). ↑/↓, Home, End.

**layout=horizontal** (no card): five equal tabs (\`type/body-m\`, tertiary → primary), 40 above the photo + 392 copy column. The copy leaves towards the other side and the new one comes in from the side you are heading to (28px, staggered). Prev / next arrows (24px in a 32 tap zone, 8 apart) at the bottom of the copy column. ARIA tabs: ←/→, Home, End.

**image right** mirrors both layouts. Below 960 everything stacks and the tab row scrolls sideways.

Photos: Figma has one photo for every topic; each topic now has its own (Background Checks is the Figma photo, the other four are the Unsplash photos from the services section) so the wipe reads. In Figma the open topic in the vertical layout is titled “Drug & Alcohol Testing” twice; the module uses the horizontal set (“Background Checks” open).` } } },
};

const block = (key) => ({ render: () => wrap('ds-mod', mod(key)) });
export const VerticalImageLeft = { name: 'layout=vertical, view=image left', ...block('carousel-vertical-left') };
export const VerticalImageRight = { name: 'layout=vertical, view=image right', ...block('carousel-vertical-right') };
export const HorizontalImageLeft = { name: 'layout=horizontal, view=image left', ...block('carousel-horizontal-left') };
export const HorizontalImageRight = { name: 'layout=horizontal, view=image right', ...block('carousel-horizontal-right') };
