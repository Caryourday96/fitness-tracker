import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('./public/manifest.webmanifest', import.meta.url), 'utf8'));
const worker = fs.readFileSync(new URL('./public/sw.js', import.meta.url), 'utf8');

test('PWA opens as an installable standalone shell', () => {
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.src === '/static/steady-icon.svg'));
});

test('service worker only caches its explicit public shell and excludes private routes', () => {
  assert.match(worker, /const ASSETS=\['\/','\/manifest\.webmanifest'/);
  assert.match(worker, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(worker, /url\.pathname\.startsWith\('\/\.auth\/'\)/);
  assert.match(worker, /request\.method!=='GET'/);
  assert.match(worker, /CLEAR_SHELL/);
  assert.doesNotMatch(worker, /\/api\/uploads|\/api\/me|\/api\/history/);
});
