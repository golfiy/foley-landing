import { create } from 'storybook/theming';

/**
 * Storybook chrome (sidebar, toolbar, docs pages) uses Inter Display in a light cut.
 * "Foley SB" is declared in manager-head.html and preview.css: it maps weights one step
 * lighter (regular text → Light, medium → Regular, bold → Medium) so hierarchy survives.
 * Component previews keep the site's own fonts.
 */
export const DS_FONT = '"Foley SB", "Inter Display", Inter, system-ui, sans-serif';

export const foleyTheme = create({
  base: 'light',
  brandTitle: 'Foley · Design System',
  brandUrl: 'http://127.0.0.1:4965/',
  brandTarget: '_self',
  colorPrimary: '#294C5A',
  colorSecondary: '#1A3946',
  appBg: '#F8F9FC',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#FFFFFF',
  appBorderColor: '#E1EAFA',
  textColor: '#111117',
  textMutedColor: '#70707D',
  barBg: '#FFFFFF',
  fontBase: DS_FONT,
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});
