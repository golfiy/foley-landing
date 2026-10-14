import { pageBody, live } from '../lib/site.js';

export default {
  title: 'Pages/Homepage',
  parameters: { docs: { description: { component: 'The whole landing assembled from the components above, running the real scripts. Same page as http://127.0.0.1:4965/.' } } },
};

export const Homepage = {
  render: () => { const d = document.createElement('div'); d.innerHTML = pageBody(); return d; },
  parameters: live(900),
};
