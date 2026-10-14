import { pick, wrap } from '../lib/site.js';

export default {
  title: 'Components/Title Text',
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: `Figma component **title_text**: section heading block. 628px wide, \`type/h2\` title, 24px gap, \`type/subtitle\` text capped at 424px. On dark sections the colour switches to \`--color-text-light\`.

Sections follow one rhythm: 140px vertical padding, 48px from the title block to content, 48px to the section CTA (32px on mobile).` } } },
};

export const Default = { render: () => wrap('ds-pad', pick('#snapshot .title-text')) };
export const TwoParagraphs = { name: 'With two paragraphs', render: () => wrap('ds-pad', pick('#guidance .title-text')) };
export const OnPhoto = { name: 'On photo (banner)', render: () => wrap('ds-pad ds-dark', pick('.band .title-text')) };
