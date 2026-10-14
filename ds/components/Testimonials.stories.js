import { pick, wrap, live } from '../lib/site.js';

export default {
  title: 'Components/Testimonials',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`testimonials\`: \`--gradient-primary\` section, **testimonial_card**s 522px with a 20px gap, aligned to the column and running off the right edge (the next card peeks). Round arrows in the title row (site change; Figma has them outside a centred track) (hover: \`--color-overlay-on-dark-hover\`, 3px nudge; disabled at the ends at 30% opacity).

**Behaviour:** steps one card at a time (800ms ease-out); drag / swipe (60px threshold) and ←/→ on the focused track. One card per view below 960, arrows move under the track.

Cards 3–6 (DNC Logistics, Torc Robotics, Pet Food Experts, LDI) are **demo content**: quotes, names and numbers are invented and must be replaced before publishing.` } } },
};

export const Static = { render: () => pick('#results') };
export const Live = { render: () => pick('#results'), parameters: live(720) };
