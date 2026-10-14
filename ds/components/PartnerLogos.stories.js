import { pick, wrap, live } from '../lib/site.js';

export default {
  title: 'Components/Partner Logos',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`partner_logos\`: “Trusted by 50,000 customers” (\`type/body-l-medium\`) over a row of mono partner logos (\`partners_logo\`, 48px tall, 64px gap) with 48px fade masks at both ends.

**Live:** the row loops as a marquee (42s per cycle), the number counts up from 0 when it enters the viewport. No hover effects on logos. Reduced motion: static row, final number.` } } },
};

export const Static = { render: () => wrap('', pick('#customers')) };
export const Live = { render: () => wrap('', pick('#customers')), parameters: live(320) };
