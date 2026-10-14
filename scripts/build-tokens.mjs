// Build tokens.css from tokens/foley.tokens.json (W3C DTCG). Run: node scripts/build-tokens.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('..', import.meta.url);
const t = JSON.parse(readFileSync(new URL('tokens/foley.tokens.json', root), 'utf8'));
const lines = [];
const fam = (k) => `var(--font-${k})`;
const walk = (node, path) => {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) emit([...path, k], v);
    else if (v && typeof v === 'object') walk(v, [...path, k]);
  }
};
const emit = (path, tok) => {
  const [group] = path;
  const name = path.join('-').replace(/^font-family-/, 'font-');
  const v = tok.$value;
  switch (tok.$type) {
    case 'gradient': {
      const angle = tok.$extensions?.foley?.angle ?? 180;
      lines.push(`  --${name}: linear-gradient(${angle}deg, ${v.map((s) => `${s.color} ${+(s.position * 100).toFixed(3)}%`).join(', ')});`);
      break;
    }
    case 'fontFamily': lines.push(`  --${name}: ${v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ')};`); break;
    case 'typography': {
      const n = path.slice(1).join('-');
      lines.push(`  --type-${n}: ${v.fontWeight} ${v.fontSize}/${v.lineHeight} ${fam(v.fontFamily)};`);
      lines.push(`  --type-${n}-tracking: ${v.letterSpacing === '0' ? '0px' : v.letterSpacing};`);
      break;
    }
    case 'cubicBezier': lines.push(`  --${name}: cubic-bezier(${v.join(', ')});`); break;
    default: lines.push(`  --${name}: ${v};`);
  }
};
walk(t, []);
const typeClasses = Object.keys(t.typography).filter((k) => !k.startsWith('$'))
  .map((k) => `.type-${k} { font: var(--type-${k}); letter-spacing: var(--type-${k}-tracking);${k === 'overline' ? ' text-transform: uppercase;' : ''} font-variation-settings: "opsz" 32; }`);
const css = `/* GENERATED from tokens/foley.tokens.json by scripts/build-tokens.mjs. Do not edit by hand. */\n:root {\n${lines.join('\n')}\n}\n\n/* Type helpers: one class per Figma text style */\n${typeClasses.join('\n')}\n`;
writeFileSync(new URL('tokens.css', root), css);
console.log(`tokens.css: ${lines.length} custom properties, ${typeClasses.length} type helpers`);
