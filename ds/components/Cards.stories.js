import { pick, pickAll, wrap, state } from '../lib/site.js';

export default {
  title: 'Components/Cards',
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: `Content cards. All square, \`--color-bg-tertiary\`, with the 12px mark at 8/8.

| Card | Figma | Class | Content | Hover |
|---|---|---|---|---|
| Text card | text_card | \`.trio-card\` | overline, \`type/h4\`, \`type/body-m\` tertiary | none |
| FAQ card | faq_card | \`.faq-card\` | \`type/h3\` (70px box), \`type/body-l\` secondary, arrow link | \`--color-bg-tertiary-hover\` |
| Testimonial card | testimonial_card | \`.case\` | logo + overline, \`type/h3\`, rule, \`type/subtitle\` quote, author | none (link only) |` } } },
};

export const TextCards = { name: 'Text card (row of three)', render: () => wrap('', pick('.trio')) };
export const FaqCard = {
  name: 'FAQ card: default vs hover',
  render: () => wrap('ds-row', ['default', 'hover'].map((s) => { const c = pick('.faq-card'); c.dataset.state = s; c.style.width = '400px'; return state(s, c); })),
  parameters: { pseudo: { hover: ['[data-state="hover"]'] } },
};
export const TestimonialCard = {
  name: 'Testimonial card',
  render: () => wrap('ds-pad ds-dark ds-row', pickAll('.case').slice(0, 2).map((c) => { c.style.width = '522px'; c.style.flex = 'none'; return c; })),
};
