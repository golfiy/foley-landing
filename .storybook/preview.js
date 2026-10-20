import '../tokens.css';
import '../styles.css';
import '../stages.css';
import '../modules.css';
import './preview.css';
import appSrc from '../app.js?raw';
import stagesSrc from '../stages.js?raw';
import modulesSrc from '../modules.js?raw';
import { foleyTheme } from './theme.js';

/**
 * Live stories run the site's real app.js / stages.js against the story markup.
 * Both scripts bind document-level listeners once, so a live story always gets a fresh
 * preview document: switching away from (or between) live stories reloads the iframe.
 */
const live = (storyFn, ctx) => {
  const booted = window.__foleyLive;
  if (booted && booted !== ctx.id) {
    location.reload();
    return document.createElement('div');
  }
  const out = storyFn();
  if (ctx.parameters.live && !booted && ctx.viewMode === 'story') {
    window.__foleyLive = ctx.id;
    setTimeout(() => {
      document.documentElement.classList.add('js');
      for (const src of [stagesSrc, appSrc]) {
        const s = document.createElement('script');
        s.textContent = src;
        document.body.append(s);
      }
      const setup = ctx.parameters.liveSetup;
      if (setup) setTimeout(() => setup(document), 200);
    }, 30);
  }
  return out;
};

// page modules: modules.js binds per element, so it is loaded once and re-run on every render
{
  const s = document.createElement('script');
  s.textContent = modulesSrc;
  document.head.append(s);
}
const modules = (storyFn) => {
  const out = storyFn();
  requestAnimationFrame(() => window.FoleyModules && window.FoleyModules.init(document));
  return out;
};

export default {
  decorators: [live, modules],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'todo' },
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#FFFFFF' },
        tertiary: { name: 'bg/tertiary', value: '#F8F9FC' },
        dark: { name: 'Petrol', value: '#0A171C' },
      },
    },
    docs: { theme: foleyTheme, story: { inline: true }, codePanel: true },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations', ['Colors', 'Typography', 'Layout & Spacing', 'Iconography', 'Motion', 'Imagery', 'Accessibility'],
          'Components', ['Button', 'Link', 'Input', 'Badge & Mark', 'Title Text', 'Top Navigation', 'Mega Menu', 'Search', 'Mobile Drawer', 'Hero', 'Partner Logos', 'How It Works', 'Snapshot Tabs', 'Category Row', 'Cards', 'Testimonials', 'Banner', 'Footer'],
          'Modules', ['Overview', 'Hero Screen', 'Callout Card', 'All-in Block', 'Carousel', 'Tiles Row', 'Accordion', 'FAQ', 'Contact Form'],
          'Pages',
          'Design System (MD)',
        ],
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'light' } },
};
