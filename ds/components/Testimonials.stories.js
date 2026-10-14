import { pick, wrap, live } from '../lib/site.js';

export default {
  title: 'Components/Testimonials',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`testimonials\`: \`--gradient-primary\` card in the 1280 column (80/40 padding), two **testimonial_card**s visible (482px, 20px gap, quote clamped to 2 lines), round arrow buttons outside the track (hover: \`--color-overlay-on-dark-hover\`, 3px nudge; disabled at the ends at 30% opacity).

**Behaviour:** steps one card at a time (800ms ease-out); drag / swipe (60px threshold) and ←/→ on the focused track. One card per view below 960, arrows move under the track.

Cards 3–6 (DNC Logistics, Torc Robotics, Pet Food Experts, LDI) are **demo content**: quotes, names and numbers are invented and must be replaced before publishing.` } } },
};

export const Static = { render: () => pick('#results') };
export const Live = { render: () => pick('#results'), parameters: live(720) };
