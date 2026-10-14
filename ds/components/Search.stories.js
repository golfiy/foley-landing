import { pick, wrap, live, click, type } from '../lib/site.js';

export default {
  title: 'Components/Search',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: `Site search. Opens from the info bar (or \`/\`, ⌘K / Ctrl+K; search icon on mobile) as a panel under the main bar, same curtain as the mega menu, page dimmed with \`--color-overlay-backdrop\`.

**States:** empty (popular-search chips + suggested links) · results (grouped: Products, Solutions, Resources, Company, Customer stories, On this page; match underlined in \`--color-text-secondary\`; second line = breadcrumb) · typo corrected (“Showing results for …”) · no results (hint + “Ask a compliance expert”).

**Keyboard:** combobox pattern, ↑/↓ moves the active option (\`aria-activedescendant\`), Enter opens, Esc closes and returns focus to the trigger. **Mobile:** full-screen under the bar, footer hints hidden, “Cancel” instead of Esc.

**Index:** built at runtime from the mega menus and the page (sections, stages, team rows, guides, testimonials), prefix + acronym matching (DQ, MVR), one-typo fallback.` } },
  },
};

const scene = () => wrap('', pick('header.topnav'), pick('.sp-backdrop'), pick('#drawer'), '<div style="height:900px;background:var(--gradient-primary)"></div>');
const openWith = (q) => (d) => { click(d, '[data-search-open]'); if (q) setTimeout(() => type(d, '#sp-input', q), 150); };

export const Trigger = { render: () => wrap('ds-static-menu', pick('.infobar')) };
export const Empty = { name: 'Open: empty state', render: scene, parameters: live(780, openWith('')) };
export const Results = { name: 'Open: results', render: scene, parameters: live(780, openWith('drug test')) };
export const TypoCorrected = { name: 'Open: typo corrected', render: scene, parameters: live(780, openWith('clearinhouse')) };
export const NoResults = { name: 'Open: no results', render: scene, parameters: live(600, openWith('zzqx')) };
