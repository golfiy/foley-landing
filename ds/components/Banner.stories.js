import { pick, wrap } from '../lib/site.js';

export default {
  title: 'Components/Banner',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`banner\` (688px). Photo with \`--gradient-scrim\` (black 88% → 74% → 0), \`title_text\` on light (521px, subtitle 396px so it breaks like the Figma frame), White plain + Outline buttons (both 52px).

Differences from Figma: the photo keeps its proportions (Figma stretches it ~28% vertically), anchored right and faded into the dark side; slow parallax on scroll. Below 960: vertical scrim, auto height.` } } },
};

export const Default = { render: () => pick('#contact') };
