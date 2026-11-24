import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { handlePublicWorkoutDays } from './workout-days.js';

test('MOVATI imports ignore earlier dates, deduplicate and keep visit dates off the public API', async ({ mock }) => {
  mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-24T15:00:00Z') });
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'steady-movati-'));
  const { dayFor, server } = await import('./server.js');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const route = '/api/fitdays/movati';
  let cookie = '';
  const request = (url, body, method = body ? 'POST' : 'GET') => fetch(base + url, {
    method,
    headers: { cookie, origin: base, 'Content-Type': 'application/json', 'X-Requested-With': 'Steady' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const db = new DatabaseSync(path.join(process.env.DATA_DIR, 'fitness.sqlite'));
  const publicData = () => {
    let data;
    const handled = handlePublicWorkoutDays({ method: 'GET', url: '/api/public-workout-days', headers: { host: 'fitdays.adeticket.com' } },
      { setHeader() {} }, { db, send(_response, status, value) { assert.equal(status, 200); data = value; } });
    assert.equal(handled, true);
    return data;
  };
  try {
    assert.equal((await request(route)).status, 401);
    const setup = await request('/api/setup', { email: 'movati@example.test', password: 'synthetic test password' });
    assert.equal(setup.status, 200);
    cookie = setup.headers.get('set-cookie').split(';')[0];
    const today = dayFor('UTC');
    db.prepare("INSERT INTO workouts(user_id,day,status,data,updated_at) VALUES(1,?,'completed',?,?)")
      .run(today, JSON.stringify({ exercises: [] }), today);
    assert.deepEqual(publicData().days, [today]);

    const old = await request(route, { dates: ['2026-08-31'] });
    assert.equal(old.status, 200);
    assert.deepEqual(await old.json(), { added: 0, total: 0, excluded: 1 });
    assert.deepEqual(publicData().days, [today]);
    assert.equal((await request(route, { dates: ['2099-01-01'] })).status, 400);
    assert.equal((await request(route, { dates: ['2026-09-31'] })).status, 400);

    const dates = ['2026-08-31', '2026-09-01', '2026-09-01', '2026-09-02'];
    const imported = await request(route, { dates });
    assert.equal(imported.status, 200);
    assert.deepEqual(await imported.json(), { added: 2, total: 2, excluded: 1 });
    assert.deepEqual(await (await request(route, { dates })).json(), { added: 0, total: 2, excluded: 1 });
    assert.deepEqual(await (await request(route)).json(), { total: 2 });
    const result = publicData();
    assert.equal(result.source, 'movati');
    assert.equal(result.visibility, 'counts');
    assert.equal(result.counts.year, 2);
    assert.equal(Object.hasOwn(result, 'days'), false);
    assert.equal(Object.hasOwn(result, 'bests'), false);
    assert.equal((await request('/api/fitdays/visibility', { visibility: 'dates' }, 'PUT')).status, 409);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM workouts').get().count, 1);
  } finally {
    db.close();
    await new Promise(resolve => server.close(resolve));
  }
});
