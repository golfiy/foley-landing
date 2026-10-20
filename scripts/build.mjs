#!/usr/bin/env node
/**
 * Static build of everything into dist/: the site (all root .html pages + css/js/assets)
 * at /, the design system (Storybook) at /storybook/. Same layout as GitHub Pages.
 *
 *   npm run build
 *   python3 -m http.server 8080 --directory dist     → http://127.0.0.1:8080/ and /storybook/
 */
import { execSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = root + 'dist/';
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
run('node scripts/build-tokens.mjs');
run('node scripts/catalog.mjs');
run('npx storybook build -o dist/storybook --disable-telemetry --quiet');
const files = readdirSync(root).filter((f) => /\.(html|css|js)$/.test(f));
for (const f of files) cpSync(root + f, dist + f);
cpSync(root + 'assets', dist + 'assets', { recursive: true });
writeFileSync(dist + '.nojekyll', '');
console.log(`dist/: ${files.length} site files + assets + storybook/`);
