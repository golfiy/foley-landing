import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Modules/Contact Form',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`contact form\` (1243:14624), six layouts of one form. Fields: Company name · First / Last name (one row, 24 apart) · Email · Phone Number · Number of Drivers · DOT Number, **32 apart**; **Submit** (Primary) 40 below. Heading: \`type/h2\` + \`type/subtitle\` (424), 24 apart. Fields are **Components / Input**.

| Layout | Container | Content |
|---|---|---|
| A | \`bg/tertiary\` card, padding 40, brand mark | form column (590: heading, fields, submit) + photo filling the rest |
| B | \`linear/primary\` frame, padding 40 | photo (552) + \`bg/tertiary\` panel, padding 48 (shown filled) |
| C | \`bg/tertiary\` card, padding 40, brand mark | heading (590) + form (rest), 40 apart |
| D | \`linear/primary\` frame, padding 40 | layout C inside, without the mark |
| E | page | heading (630) on the left, a 372 \`bg/tertiary\` card (padding 40) with a \`type/h3\` card title and single-column fields on the right, 80 apart |
| E (no title) | page | E without the card title |

**Behaviour (site addition):** required fields (company, names, email) and an email check on submit; invalid fields get the error state and a message, focus moves to the first one; the status line confirms a valid submit. Placeholder copy; no data is sent anywhere.
Below 960 every layout stacks (photo first in A), names stay in one row until 600.

Figma note: D sits off the 80px grid in its frame (x 69, 1302 wide); here it uses the 1280 column like the others.` } } },
};

const form = (key) => ({ render: () => wrap('ds-mod', mod(key)) });
export const A = { name: 'A: form + photo', ...form('contact-a') };
export const B = { name: 'B: dark frame, photo + form (filled)', ...form('contact-b') };
export const C = { name: 'C: heading + form in a card', ...form('contact-c') };
export const D = { name: 'D: C in a dark frame', ...form('contact-d') };
export const E = { name: 'E: heading + narrow card with title', ...form('contact-e') };
export const EPlain = { name: 'E: heading + narrow card, no title', ...form('contact-e-plain') };
