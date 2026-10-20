import { modulesBody } from '../lib/site.js';

export default {
  title: 'Modules/Overview',
  parameters: { docs: { description: { component: `Every page module on one page, in the order of the Figma “modules” section. The same page lives on the site as \`modules.html\` (Site / DS switch → Site, then /modules.html).` } } },
};

export const AllModules = { name: 'All modules (modules.html)', render: () => modulesBody() };
