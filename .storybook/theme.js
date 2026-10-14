import { create } from 'storybook/theming';

/**
 * Storybook chrome follows the IBM Design Language site structure (dark top bar,
 * white side nav, flat square surfaces) but every value is a Foley token:
 * bg-inverse #0A171C, bg-primary #294C5A, strokes #C1CFE6 / #E1EAFA, Inter Display.
 * Layout details that the theme API cannot reach live in manager-head.html / preview.css.
 */
export const DS_FONT = '"Inter Display", Inter, system-ui, sans-serif';

export const foleyTheme = create({
  base: 'light',
  brandTitle: 'Foley <b>Design System</b>',
  brandUrl: 'http://127.0.0.1:4965/',
  brandTarget: '_self',
  colorPrimary: '#294C5A',
  colorSecondary: '#294C5A',
  appBg: '#FFFFFF',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#FFFFFF',
  appBorderColor: '#E1EAFA',
  appBorderRadius: 0,
  barBg: '#0A171C',
  barTextColor: 'rgba(255, 255, 255, 0.72)',
  barHoverColor: '#FFFFFF',
  barSelectedColor: '#FFFFFF',
  buttonBg: '#FFFFFF',
  buttonBorder: '#C1CFE6',
  inputBg: '#EEEEF2',
  inputBorder: 'transparent',
  inputTextColor: '#111117',
  inputBorderRadius: 0,
  textColor: '#111117',
  textInverseColor: '#FFFFFF',
  textMutedColor: '#70707D',
  fontBase: DS_FONT,
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});
