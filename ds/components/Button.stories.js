import { pick, wrap, state } from '../lib/site.js';

const ARROW = { teal: 'assets/v2/ico/arrow-white.svg', white: 'assets/v2/ico/arrow-ink.svg', outline: 'assets/v2/ico/arrow-white.svg' };

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Figma component **button**. Label: \`type/button\` (Inter Display SemiBold 18/20, -0.5px). Square corners, no radius.

| Variant | Class | Use |
|---|---|---|
| Primary | \`.btn.btn-teal\` | Main action on light sections (Get Demo, Platform Overview) |
| Primary compact | \`.btn.btn-teal.btn-head\` | Header and footer CTA, no icon, 12/24 padding |
| White | \`.btn.btn-white\` | Main action on dark or photo backgrounds |
| White plain | \`.btn.btn-white.btn-plain\` | White without icon (banner) |
| Outline | \`.btn.btn-outline\` | Secondary action on dark: 1px white inner stroke |
| Text | \`.btn.btn-text\` | Tertiary action (Log in) |

**Anatomy:** label + optional 24px arrow (\`.btn-ico\`), padding 14 16 14 24 with icon, 16/24 without.
**Hover:** fill slides in from the left (\`::before\`, 500ms ease-out), the arrow moves 4px right. **Active:** 1px down. **Focus:** 2px ring (\`--color-focus-ring\`), offset 3px.`,
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['teal', 'white', 'outline', 'text'] },
    label: { control: 'text' },
    icon: { control: 'boolean' },
  },
};

const build = ({ variant, label, icon }) => {
  const a = document.createElement('a');
  a.href = '#';
  a.className = `btn btn-${variant}` + (variant === 'white' && !icon ? ' btn-plain' : '') + (variant === 'teal' && !icon ? ' btn-head' : '');
  a.innerHTML = `<span class="btn-label">${label}</span>` + (icon && ARROW[variant] ? `<img class="btn-ico" src="${ARROW[variant]}" width="24" height="24" alt="">` : '');
  return a;
};

export const Playground = {
  args: { variant: 'teal', label: 'Get Demo', icon: true },
  render: (args) => wrap(`ds-pad ${args.variant === 'white' || args.variant === 'outline' ? 'ds-dark' : ''}`, build(args)),
};

export const Primary = { render: () => wrap('ds-row', pick('#snapshot .sec-cta'), pick('.head-cta .btn-head')) };

export const OnDark = {
  name: 'White & Outline (on dark)',
  render: () => wrap('ds-pad ds-dark ds-row', pick('.hero-ctas .btn-white'), pick('.hero-ctas .btn-outline'), pick('.band-ctas .btn-plain')),
};

export const Text = { render: () => wrap('ds-row', pick('.head-cta .btn-text')) };

const matrix = (make, dark) => wrap(`ds-pad ds-row ${dark ? 'ds-dark' : ''}`,
  ['default', 'hover', 'focus', 'active'].map((s) => { const b = make(); b.id = `btn-${s}-${Math.random().toString(36).slice(2, 6)}`; b.dataset.state = s; return state(s, b); }));

export const StatesPrimary = {
  name: 'States: Primary',
  render: () => matrix(() => pick('#snapshot .sec-cta')),
  parameters: { pseudo: { hover: ['[data-state="hover"]'], focusVisible: ['[data-state="focus"]'], active: ['[data-state="active"]'] } },
};
export const StatesWhite = {
  name: 'States: White',
  render: () => matrix(() => pick('.hero-ctas .btn-white'), true),
  parameters: { pseudo: { hover: ['[data-state="hover"]'], focusVisible: ['[data-state="focus"]'], active: ['[data-state="active"]'] } },
};
export const StatesOutline = {
  name: 'States: Outline',
  render: () => matrix(() => pick('.hero-ctas .btn-outline'), true),
  parameters: { pseudo: { hover: ['[data-state="hover"]'], focusVisible: ['[data-state="focus"]'], active: ['[data-state="active"]'] } },
};
