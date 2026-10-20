import { mod, wrap } from '../lib/site.js';

export default {
  title: 'Components/Input',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `Figma \`input\` (used by every **Contact Form**). **48px** tall, padding 12 / 16, **radius 4** (the only rounded control besides pills), \`bg/secondary\` fill, \`type/body-s-medium\` (16/24, 500). Placeholder \`text/tertiary\`, value \`text/primary\`.

| State | Look | Source |
|---|---|---|
| placeholder / filled | as above | Figma |
| hover | 1px inset \`stroke/primary\` | site addition |
| focus | white fill + 1px inset \`bg/primary\` | site addition |
| error | 1px inset \`status/error\`, 14px message 6 below in \`status/error\` | site addition |
| disabled | 50% opacity, no hover | site addition |

Figma uses the placeholder as the label. Each input also has a visually hidden \`<label>\` so screen readers announce it; consider visible labels above the fields for long forms (placeholders disappear while typing). Errors are wired with \`aria-invalid\` + \`aria-describedby\`.` } } },
};

export const States = {
  name: 'States',
  render: () => wrap('ds-mod', mod('input-states')),
  parameters: { pseudo: { hover: ['[data-state="hover"] .m-input'] } },
};
