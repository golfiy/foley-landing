/** Foley design system – Storybook config. Stories and docs live in /ds, styles and scripts are the site's own files. */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import remarkGfm from 'remark-gfm';

const root = fileURLToPath(new URL('..', import.meta.url));
const VIRTUAL = 'virtual:foley-site';

/**
 * Storybook owns the /index.html route and serves /assets as static files, so the site's
 * markup and icon list are handed to stories through a virtual module instead of URL imports.
 */
const foleySite = () => ({
  name: 'foley-site',
  resolveId: (id) => (id === VIRTUAL ? '\0' + VIRTUAL : null),
  load(id) {
    if (id !== '\0' + VIRTUAL) return null;
    const file = root + 'index.html';
    const modules = root + 'modules.html';
    this.addWatchFile(file);
    this.addWatchFile(modules);
    const icons = ['ico', 'social'].flatMap((d) => readdirSync(root + 'assets/v2/' + d).filter((f) => f.endsWith('.svg')).map((f) => `assets/v2/${d}/${f}`));
    return `export const html = ${JSON.stringify(readFileSync(file, 'utf8'))};\nexport const modulesHtml = ${JSON.stringify(readFileSync(modules, 'utf8'))};\nexport const icons = ${JSON.stringify(icons)};`;
  },
});

export default {
  framework: { name: '@storybook/html-vite', options: {} },
  stories: ['../ds/**/*.mdx', '../ds/**/*.stories.js'],
  addons: [
    // GitHub-flavoured markdown so tables in the MDX pages render
    { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } },
    '@storybook/addon-a11y',
    'storybook-addon-pseudo-states',
  ],
  staticDirs: [{ from: '../assets', to: '/assets' }],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  // hide Storybook's own "Get started" onboarding widget, it is noise in a DS
  features: { sidebarOnboardingChecklist: false, menuOnboardingChecklist: false },
  docs: { defaultName: 'Overview' },
  viteFinal: (config) => {
    config.plugins = [...(config.plugins || []), foleySite()];
    return config;
  },
};
