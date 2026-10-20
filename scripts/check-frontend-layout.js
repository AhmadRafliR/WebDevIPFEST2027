import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = readFileSync(path.join(root, 'webpack.config.babel.js'), 'utf8');
const entries = [...config.matchAll(/:\s*['"](\.\/[^'"]+\.js)['"]/g)].map((match) => match[1]);

assert(entries.length > 0, 'Webpack must declare frontend entry points');
assert(!entries.some((entry) => entry.startsWith('./public/src/')), 'Webpack sources belong outside public/');
for (const entry of entries) {
  assert(statSync(path.resolve(root, entry)).isFile(), `Missing Webpack entry: ${entry}`);
}

for (const file of readdirSync(path.join(root, 'src')).filter((name) => name.endsWith('.js'))) {
  const source = readFileSync(path.join(root, 'src', file), 'utf8');
  for (const [, imported] of source.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    assert(statSync(path.resolve(root, 'src', imported)).isFile(), `Missing import in src/${file}: ${imported}`);
  }
}

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(fullPath) : entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

for (const file of htmlFiles(path.join(root, 'public'))) {
  assert(!/\bsrc\/[^"']+\.js/.test(readFileSync(file, 'utf8')), `HTML must load built bundles, not source: ${path.relative(root, file)}`);
}
