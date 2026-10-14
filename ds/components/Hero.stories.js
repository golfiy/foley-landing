import { pick, wrap, live, click } from '../lib/site.js';

export default {
  title: 'Components/Hero',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: `Figma component **hero** (1440×627). Left layout: 656px, 64/80 padding, content centred with 32px gaps. Display word \`type/display\` in \`--color-brand-primary\`, then \`type/h1\`, \`type/body-l\` lead (max 496px), White + Outline buttons.

**Mosaic:** 6×4 grid of 156px tiles on a 157px pitch (1px seams). Three photo blocks in a staircase: A (3×2, top), T (3×2, right), C (3×2 minus its top-right tile, bottom); 8 empty tiles use \`--color-overlay-tile\`. Each scene is one 2× WebP with transparent gaps, cut per tile in CSS.

**Scenes:** Onboard (Figma frame) → Monitor → Hire, every 6s. The display word rolls like an odometer (per-letter, 42ms stagger, \`--motion-easing-odometer\`); tiles swap with a diagonal wave (clip-path + scale + brightness), Flip and Fade are available for review. Autoplay pauses on hover, on hidden tabs and off-screen. Pointer parallax on the grid; on scroll the copy drifts up and fades.

Below 1440 the canvas scales with \`zoom\`; below 960 the copy stacks above a full-width mosaic.` } },
  },
};

const scene = () => wrap('', pick('#hero'), pick('#demo'));
const to = (name, fx) => (d) => { if (fx) click(d, `#demo [data-key="fx"] [data-v="${fx}"]`); setTimeout(() => click(d, `#demo [data-key="scene"] [data-v="${name}"]`), 2300); };

export const Onboard = { name: 'Onboard (Figma frame)', render: scene, parameters: live(640) };
export const Monitor = { render: scene, parameters: live(640, to('monitor')) };
export const Hire = { render: scene, parameters: live(640, to('hire')) };
export const FlipTransition = { name: 'Transition: flip', render: scene, parameters: live(640, to('hire', 'flip')) };
