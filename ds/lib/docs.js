/* React helpers for the MDX foundation pages. Everything is read from tokens/foley.tokens.json. */
import { createElement as h, Fragment } from 'react';
import tokens from '../../tokens/foley.tokens.json';

const leaves = (node, path = []) => Object.entries(node).flatMap(([k, v]) => {
  if (k.startsWith('$')) return [];
  if (v && typeof v === 'object' && '$value' in v) return [{ path: [...path, k], ...v }];
  return v && typeof v === 'object' ? leaves(v, [...path, k]) : [];
});
const cssVar = (path) => `--${path.join('-')}`;
const src = (t) => t.$extensions?.foley?.source || t.$extensions?.foley?.figmaStyle || '';
const isSite = (t) => src(t) === 'site';

const S = {
  table: { width: '100%', borderCollapse: 'collapse', font: '400 14px/1.4 var(--ds-font)', margin: '16px 0 32px' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--color-stroke-primary)', color: 'var(--color-text-tertiary)', fontWeight: 500, fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase' },
  td: { padding: '10px 12px', borderBottom: '1px solid var(--color-stroke-secondary)', verticalAlign: 'middle' },
  code: { font: '500 12.5px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace', color: 'var(--color-text-secondary)' },
  tag: (site) => ({ display: 'inline-block', padding: '2px 6px', font: '600 11px/1.3 var(--ds-font)', borderRadius: 4, background: site ? '#FFF4E5' : '#EAF1FC', color: site ? '#9A4D00' : '#294C5A' }),
};
const Tag = ({ t }) => h('span', { style: S.tag(isSite(t)) }, isSite(t) ? 'site addition' : src(t).replace(/^figma: /, 'Figma '));
const Code = ({ children }) => h('code', { style: S.code }, children);
const Table = ({ head, rows }) => h('table', { style: S.table },
  h('thead', null, h('tr', null, head.map((c) => h('th', { key: c, style: S.th }, c)))),
  h('tbody', null, rows));

export function ColorTable({ group }) {
  const list = leaves(tokens.color[group], ['color', group]);
  return h(Table, {
    head: ['', 'Token', 'Value', 'Source', 'Use'],
    rows: list.map((t) => h('tr', { key: t.path.join('.') },
      h('td', { style: { ...S.td, width: 64 } }, h('div', { style: { width: 48, height: 48, background: t.$value, border: '1px solid var(--color-stroke-secondary)' } })),
      h('td', { style: S.td }, h(Code, null, `var(${cssVar(t.path)})`), h('div', { style: { color: 'var(--color-text-tertiary)', fontSize: 12, marginTop: 4 } }, t.path.join('/'))),
      h('td', { style: S.td }, h(Code, null, t.$value)),
      h('td', { style: S.td }, h(Tag, { t })),
      h('td', { style: S.td }, t.$description))),
  });
}

export function GradientTable() {
  const list = leaves(tokens.gradient, ['gradient']);
  return h(Table, {
    head: ['', 'Token', 'Stops', 'Source', 'Use'],
    rows: list.map((t) => h('tr', { key: t.path.join('.') },
      h('td', { style: { ...S.td, width: 160 } }, h('div', { style: { width: 144, height: 56, background: `var(${cssVar(t.path)})`, border: '1px solid var(--color-stroke-secondary)' } })),
      h('td', { style: S.td }, h(Code, null, `var(${cssVar(t.path)})`)),
      h('td', { style: S.td }, h(Code, null, `${t.$extensions.foley.angle}° · ` + t.$value.map((s) => `${s.color} ${Math.round(s.position * 1000) / 10}%`).join(' → '))),
      h('td', { style: S.td }, h(Tag, { t })),
      h('td', { style: S.td }, t.$description))),
  });
}

export function TypeTable() {
  const list = leaves(tokens.typography, ['typography']);
  return h(Table, {
    head: ['Style', 'Specimen', 'Spec'],
    rows: list.map((t) => {
      const n = t.path[1]; const v = t.$value;
      const big = parseInt(v.fontSize, 10) > 40;
      return h('tr', { key: n },
        h('td', { style: { ...S.td, width: 170 } }, h(Code, null, `.type-${n}`), h('div', { style: { color: 'var(--color-text-tertiary)', fontSize: 12, marginTop: 4 } }, `Figma ${t.$extensions.foley.figmaStyle}`)),
        h('td', { style: { ...S.td, maxWidth: 560, overflow: 'hidden' } }, h('div', { className: `sb-unstyled type-${n}`, style: { whiteSpace: big ? 'nowrap' : 'normal', color: n === 'display' ? 'var(--color-brand-primary)' : 'var(--color-text-primary)', background: n === 'display' ? 'var(--color-bg-inverse)' : 'none', padding: n === 'display' ? '0 12px' : 0 } }, n === 'display' ? 'Onboard' : n === 'overline' ? 'When an alert lands' : n === 'button' ? 'Request a demo' : 'Know what to do next')),
        h('td', { style: S.td }, h(Code, null, `${v.fontWeight} · ${v.fontSize}/${v.lineHeight} · ${v.letterSpacing}`), h('div', { style: { color: 'var(--color-text-tertiary)', fontSize: 12, marginTop: 4 } }, t.$description)));
    }),
  });
}

export function SpaceScale() {
  const list = leaves(tokens.space, ['space']);
  return h(Table, {
    head: ['Token', 'Value', ''],
    rows: list.map((t) => h('tr', { key: t.path.join('.') },
      h('td', { style: { ...S.td, width: 180 } }, h(Code, null, `var(${cssVar(t.path)})`)),
      h('td', { style: { ...S.td, width: 80 } }, h(Code, null, t.$value)),
      h('td', { style: S.td }, h('div', { style: { width: t.$value, height: 12, background: 'var(--color-bg-primary)' } })))),
  });
}

export function DimensionTable({ group }) {
  const list = leaves(tokens[group], [group]);
  return h(Table, {
    head: ['Token', 'Value', 'Note'],
    rows: list.map((t) => h('tr', { key: t.path.join('.') },
      h('td', { style: S.td }, h(Code, null, group === 'breakpoint' ? `@media (max-width: ${t.$value})` : `var(${cssVar(t.path)})`)),
      h('td', { style: S.td }, h(Code, null, String(t.$value))),
      h('td', { style: S.td }, t.$description || ''))),
  });
}

export function MotionTable() {
  const d = leaves(tokens.motion.duration, ['motion', 'duration']);
  const e = leaves(tokens.motion.easing, ['motion', 'easing']);
  return h(Fragment, null,
    h(Table, { head: ['Duration', 'Value', 'Use'], rows: d.map((t) => h('tr', { key: t.path.join('.') }, h('td', { style: S.td }, h(Code, null, `var(${cssVar(t.path)})`)), h('td', { style: S.td }, h(Code, null, t.$value)), h('td', { style: S.td }, t.$description))) }),
    h(Table, {
      head: ['Easing', 'Curve', 'Demo (hover the row)', 'Use'],
      rows: e.map((t) => h('tr', { key: t.path.join('.'), className: 'ds-ease-row' },
        h('td', { style: S.td }, h(Code, null, `var(${cssVar(t.path)})`)),
        h('td', { style: S.td }, h(Code, null, `cubic-bezier(${t.$value.join(', ')})`)),
        h('td', { style: { ...S.td, width: 260 } }, h('div', { style: { position: 'relative', height: 16, background: 'var(--color-bg-tertiary)' } }, h('i', { className: 'ds-ease-dot', style: { transitionTimingFunction: `var(${cssVar(t.path)})` } }))),
        h('td', { style: S.td }, t.$description))),
    }));
}

import { icons } from 'virtual:foley-site';
export function IconGrid() {
  const list = icons.map((p) => ({ name: p.split('/').slice(-2).join('/').replace('.svg', ''), url: p }));
  return h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 0, borderTop: '1px solid var(--color-stroke-secondary)', borderLeft: '1px solid var(--color-stroke-secondary)', margin: '16px 0 32px' } },
    list.map((i) => h('div', { key: i.name, style: { borderRight: '1px solid var(--color-stroke-secondary)', borderBottom: '1px solid var(--color-stroke-secondary)', background: i.name.includes('white') ? 'var(--color-bg-primary)' : '#fff', padding: '20px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 } },
      h('img', { src: i.url, alt: '', style: { width: 24, height: 24, objectFit: 'contain' } }),
      h('span', { style: { ...S.code, fontSize: 11, color: i.name.includes('white') ? '#fff' : 'var(--color-text-tertiary)', textAlign: 'center' } }, i.name))));
}

/* WCAG contrast of every text token on every background it is used on */
const lum = (hex) => { const n = hex.replace('#', ''); const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
export function ContrastTable() {
  const c = tokens.color;
  const pairs = [
    ['text/primary', c.text.primary.$value, 'bg/light', c.bg.light.$value],
    ['text/primary', c.text.primary.$value, 'bg/tertiary', c.bg.tertiary.$value],
    ['text/primary', c.text.primary.$value, 'bg/secondary', c.bg.secondary.$value],
    ['text/secondary', c.text.secondary.$value, 'bg/light', c.bg.light.$value],
    ['text/secondary', c.text.secondary.$value, 'bg/tertiary', c.bg.tertiary.$value],
    ['text/tertiary', c.text.tertiary.$value, 'bg/light', c.bg.light.$value],
    ['text/tertiary', c.text.tertiary.$value, 'bg/tertiary', c.bg.tertiary.$value],
    ['text/light', c.text.light.$value, 'bg/primary', c.bg.primary.$value],
    ['text/light', c.text.light.$value, 'bg/inverse', c.bg.inverse.$value],
    ['brand/primary', c.brand.primary.$value, 'bg/inverse', c.bg.inverse.$value],
    ['brand/primary', c.brand.primary.$value, 'bg/light', c.bg.light.$value],
  ];
  return h(Table, {
    head: ['Foreground', 'Background', 'Ratio', 'WCAG'],
    rows: pairs.map(([fn, fv, bn, bv]) => { const r = ratio(fv, bv); const grade = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'Decorative only'; return h('tr', { key: fn + bn },
      h('td', { style: S.td }, h('span', { style: { display: 'inline-block', width: 14, height: 14, background: fv, border: '1px solid var(--color-stroke-secondary)', marginRight: 8, verticalAlign: -2 } }), h(Code, null, fn)),
      h('td', { style: S.td }, h('span', { style: { display: 'inline-block', width: 14, height: 14, background: bv, border: '1px solid var(--color-stroke-secondary)', marginRight: 8, verticalAlign: -2 } }), h(Code, null, bn)),
      h('td', { style: S.td }, h('span', { style: { padding: '4px 10px', background: bv, color: fv, font: '500 14px var(--ds-font)' } }, `${r.toFixed(2)}:1`)),
      h('td', { style: S.td }, grade)); }),
  });
}
