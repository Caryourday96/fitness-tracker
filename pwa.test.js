import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('./public/manifest.webmanifest', import.meta.url), 'utf8'));
const html = fs.readFileSync(new URL('./public/index.html', import.meta.url), 'utf8');

test('iPhone home-screen app metadata launches the standalone tracker', () => {
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.src === '/static/steady-icon.svg'));
  assert.match(html, /href="\/static\/manifest\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable" content="yes"/);
});

test('the app does not cache private account data for offline use', () => {
  const app = fs.readFileSync(new URL('./public/app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /serviceWorker\.register/);
  assert.match(app, /registration\.unregister\(\)/);
  assert.match(app, /steady-public-shell-v1/);
});
