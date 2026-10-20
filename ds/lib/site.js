/**
 * Stories never copy markup: they clone it from the landing's index.html at build time,
 * so the design system and the site cannot drift apart.
 */
import { html as indexHtml, modulesHtml } from 'virtual:foley-site';

const doc = new DOMParser().parseFromString(indexHtml, 'text/html');
const modDoc = new DOMParser().parseFromString(modulesHtml, 'text/html');

/** Clone the first element matching `selector` from index.html. */
export function pick(selector) {
  const el = doc.querySelector(selector);
  if (!el) throw new Error(`[ds] "${selector}" not found in index.html`);
  return el.cloneNode(true);
}

/** Clone every element matching `selector`. */
export const pickAll = (selector) => [...doc.querySelectorAll(selector)].map((el) => el.cloneNode(true));

/** Wrap nodes / html strings in a container element. */
export function wrap(className, ...children) {
  const box = document.createElement('div');
  if (className) box.className = className;
  for (const c of children.flat()) {
    if (typeof c === 'string') box.insertAdjacentHTML('beforeend', c);
    else if (c) box.append(c);
  }
  return box;
}

/** A labelled cell for state matrices. */
export function state(label, node) {
  return wrap('ds-state', `<span class="ds-label">${label}</span>`, node);
}

/** Make lazy images eager (stories are screenshots, not pages). */
export function eager(root) {
  root.querySelectorAll('img[loading="lazy"]').forEach((i) => i.removeAttribute('loading'));
  return root;
}

/** Full <body> of the landing without scripts, for page-level stories. */
export function pageBody() {
  const body = doc.body.cloneNode(true);
  body.querySelectorAll('script').forEach((s) => s.remove());
  return body.innerHTML;
}

/** Parameters for a live story (real app.js + stages.js). Docs render it in its own iframe. */
export const live = (height = 700, setup) => ({
  live: true,
  liveSetup: setup,
  docs: { story: { inline: false, height: `${height}px` } },
});

/** Helpers used by live-story setups */
export const click = (doc, sel) => doc.querySelector(sel)?.click();
export function type(doc, sel, value) {
  const el = doc.querySelector(sel);
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Clone a page module from modules.html by its data-module key (eager images). */
export function mod(key) {
  const el = modDoc.querySelector(`[data-module="${key}"]`);
  if (!el) throw new Error(`[ds] module "${key}" not found in modules.html`);
  return eager(el.cloneNode(true));
}

/** Every module of modules.html in page order, for the gallery page story. */
export function modulesBody() {
  const main = modDoc.querySelector('main').cloneNode(true);
  return eager(main);
}
