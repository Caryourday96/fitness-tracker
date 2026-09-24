import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'steady-rest-day-'));
const { planFor, server } = await import('./server.js');

const profile = { schedule: 3, duration: 60 };
const check = { energy: 'high', soreness: 'none', symptoms: 'none', minutes: 60 };
const day = '2026-09-24';

test('cardio progression requires two completed targets and respects time and readiness', () => {
  const target = minutes => planFor({ ...check, minutes }, profile, day, {}).cardioProgression.targetMinutes;
  assert.equal(target(20), 0);
  assert.equal(target(40), 10);
  assert.equal(target(60), 15);
  assert.equal(target(75), 15);
  assert.equal(target(90), 15);

  const sessions = [{ targetMinutes: 15, actualMinutes: 15 }, { targetMinutes: 15, actualMinutes: 17 }];
  assert.equal(planFor(check, profile, day, { cardioSessions: sessions }).cardioProgression.targetMinutes, 20);
  assert.equal(planFor(check, profile, day, { cardioSessions: sessions.slice(0, 1) }).cardioProgression.targetMinutes, 15);
  assert.equal(planFor(check, profile, day, { cardioSessions: [{ targetMinutes: 15, actualMinutes: 14 }, sessions[1]] }).cardioProgression.targetMinutes, 15);
  assert.equal(planFor({ ...check, energy: 'low' }, profile, day, { cardioSessions: sessions }).cardioProgression.targetMinutes, 10);
  assert.equal(planFor({ ...check, minutes: 40 }, profile, day, { cardioSessions: sessions }).cardioProgression.targetMinutes, 15);
  assert.equal(planFor({ ...check, minutes: 75 }, profile, day, { cardioSessions: [{ targetMinutes: 30, actualMinutes: 30 }, { targetMinutes: 30, actualMinutes: 30 }] }).cardioProgression.targetMinutes, 30);
  assert.equal(planFor({ ...check, minutes: 90 }, profile, day, { cardioSessions: [{ targetMinutes: 25, actualMinutes: 25 }, { targetMinutes: 25, actualMinutes: 25 }] }).cardioProgression.targetMinutes, 30);
});

test('safety and recovery remain ahead of normal workout planning', () => {
  assert.equal(planFor({ ...check, systolic: 180 }, profile, day).kind, 'safety-stop');
  assert.equal(planFor({ ...check, symptoms: 'chest-pain' }, profile, day).kind, 'safety-stop');
  assert.equal(planFor(check, { ...profile, restrictions: 'clinician restriction' }, day).kind, 'safety-stop');
  assert.equal(planFor({ ...check, trainedYesterday: 'yes' }, profile, day).kind, 'recovery');
  assert.equal(planFor(check, profile, day, { sessionsInLast7: 3 }).kind, 'recovery');
});

test('rest-day override requires a safe check-in and cannot replace a started workout', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  const request = (route, body, method = 'POST') => fetch(base + route, {
    method,
    headers: { Origin: base, 'X-Requested-With': 'Steady', 'Content-Type': 'application/json', Cookie: cookie },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  try {
    const setup = await request('/api/setup', { email: 'rest@example.com', password: 'long test password here' });
    assert.equal(setup.status, 200);
    cookie = setup.headers.get('set-cookie').split(';')[0];
    assert.equal((await request('/api/profile', { timezone: 'UTC', onboardingComplete: true }, 'PUT')).status, 200);
    assert.equal((await request('/api/checkin', { ...check, trainedYesterday: 'yes' })).status, 200);
    assert.equal((await request('/api/plan/confirm', {})).status, 200);
    assert.equal((await request('/api/plan/rest-day-override', { mode: 'invalid' })).status, 400);

    for (const blocked of [
      { systolic: 180 }, { symptoms: 'chest-pain' }, { pain: 'movement-pain' },
      { soreness: 'high' }, { energy: 'low' }
    ]) {
      assert.equal((await request('/api/checkin', { ...check, trainedYesterday: 'yes', ...blocked })).status, 200);
      assert.equal((await request('/api/plan/rest-day-override', { mode: 'regular' })).status, 409);
    }
    assert.equal((await request('/api/checkin', { ...check, trainedYesterday: 'yes', energy: 'medium' })).status, 200);
    assert.equal((await request('/api/plan/rest-day-override', { mode: 'regular' })).status, 409);
    assert.equal((await request('/api/checkin', { ...check, trainedYesterday: 'yes' })).status, 200);
    const regular = await request('/api/plan/rest-day-override', { mode: 'regular' });
    assert.equal(regular.status, 200);
    const body = await regular.json();
    assert.equal(body.plan.kind, 'rest-day-override');
    assert.ok(body.plan.exercises.some(exercise => exercise.pattern === 'cardio'));
    assert.equal((await request('/api/plan/rest-day-override', { mode: 'light' })).status, 409);
    assert.equal((await request('/api/workout', { data: { exercises: [{ name: 'Treadmill walk', sets: [{ duration: 10 }] }] }, status: 'active' })).status, 200);
    assert.equal((await request('/api/plan/rest-day-override', { mode: 'regular' })).status, 409);

    // Restore only this disposable test account's recovery state to exercise the other choice.
    const db = new DatabaseSync(path.join(process.env.DATA_DIR, 'fitness.sqlite'));
    try {
      db.exec('DELETE FROM workouts');
      db.prepare("UPDATE plans SET data=?, status='confirmed'").run(JSON.stringify(planFor({ ...check, trainedYesterday: 'yes' }, profile, day)));
    } finally { db.close(); }
    assert.equal((await request('/api/profile', { injuries: 'movement restriction' }, 'PUT')).status, 200);
    assert.equal((await request('/api/plan/rest-day-override', { mode: 'light' })).status, 409);
    assert.equal((await request('/api/profile', { injuries: '', restrictions: 'clinician restriction' }, 'PUT')).status, 200);
    assert.equal((await request('/api/plan/rest-day-override', { mode: 'light' })).status, 409);
    assert.equal((await request('/api/profile', { restrictions: '' }, 'PUT')).status, 200);
    const light = await request('/api/plan/rest-day-override', { mode: 'light' });
    assert.equal(light.status, 200);
    assert.deepEqual((await light.json()).plan.exercises.map(exercise => exercise.name), ['Easy walk']);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
