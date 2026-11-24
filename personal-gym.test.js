import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

test('the private gym routine is the only startable workout and checkmarks persist without logged sets', async () => {
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'steady-personal-gym-'));
  const { dayFor, server } = await import('./server.js');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  const request = (url, body) => fetch(base + url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { cookie, origin: base, 'Content-Type': 'application/json', 'X-Requested-With': 'Steady' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const me = async () => {
    const response = await request('/api/me');
    assert.equal(response.status, 200);
    return response.json();
  };

  try {
    assert.equal((await request('/api/me')).status, 401);
    const account = await request('/api/setup', { email: 'gym@example.test', password: 'synthetic gym test password' });
    assert.equal(account.status, 200);
    cookie = account.headers.get('set-cookie').split(';')[0];
    const day = dayFor('UTC');
    const db = new DatabaseSync(path.join(process.env.DATA_DIR, 'fitness.sqlite'));
    const priorWorkout = { exercises: [{ name: 'Historical lift', pattern: 'push', sets: [{ reps: 8 }] }] };
    const legacyPlan = { kind: 'strength', exercises: [{ name: 'Old workout choice', pattern: 'push' }] };
    db.prepare('INSERT INTO plans(user_id,day,status,data) VALUES(1,?,?,?)').run(day, 'confirmed', JSON.stringify(legacyPlan));
    db.prepare('INSERT INTO workouts(user_id,day,status,data,updated_at) VALUES(1,?,?,?,?)')
      .run('2020-01-01', 'completed', JSON.stringify(priorWorkout), 'old-version');
    db.close();

    const starting = await me();
    assert.equal(starting.plan, null);
    assert.deepEqual(starting.gymRoutine.days.map(day => day.name), ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Rest']);
    assert.equal((await request('/api/checkin', { gym: 'yes', routineDay: 8 })).status, 400);
    assert.equal((await request('/api/checkin', { gym: 'yes', routineDay: 1, symptoms: 'chest-pain' })).status, 200);
    const blocked = await (await request('/api/plan/confirm', { routineDay: 2 })).json();
    assert.equal(blocked.plan.kind, 'safety-stop');
    assert.deepEqual(blocked.plan.exercises, []);
    assert.equal((await request('/api/checkin', { gym: 'yes', routineDay: 1, trainedYesterday: 'yes' })).status, 200);
    const rest = await (await request('/api/plan/confirm', { routineDay: 4 })).json();
    assert.equal(rest.plan.kind, 'routine-rest');
    assert.equal((await request('/api/workout', { data: { exercises: [] }, status: 'active' })).status, 409);
    assert.equal((await request('/api/plan/alternative', {})).status, 409);
    assert.equal((await request('/api/plan/rest-day-override', { mode: 'regular' })).status, 409);

    const { plan } = await (await request('/api/plan/confirm', { routineDay: 1 })).json();
    assert.deepEqual(plan.exercises.map(lift => [lift.name, lift.sets, lift.reps]), [
      ['Bench press', 4, '6–8'],
      ['Incline dumbbell press', 3, '8–10'],
      ['Shoulder press', 3, '8–10'],
      ['Lateral raises', 3, '12–15'],
      ['Triceps pushdowns', 3, '12–15']
    ]);
    const data = { exercises: plan.exercises.map(({ name, pattern }) => ({ name, pattern, sets: [] })) };
    assert.equal((await request('/api/workout', { data: { exercises: [{ name: 'Other lift', sets: [] }] }, status: 'active' })).status, 400);
    const started = await request('/api/workout', { data, status: 'active' });
    assert.equal(started.status, 200);
    const { version } = await started.json();
    assert.equal((await request('/api/plan/confirm', { routineDay: 6 })).status, 409);
    data.exercises[0].checkedOff = true;
    const checked = await request('/api/workout', { data, status: 'active', version });
    assert.equal(checked.status, 200);
    assert.equal((await request('/api/workout', { data, status: 'active', version })).status, 409);

    const resumed = await me();
    assert.equal(resumed.workout.exercises[0].checkedOff, true);
    assert.deepEqual(resumed.workout.exercises[0].sets, []);
    assert.equal((await request('/api/workout', { data, status: 'completed', version: resumed.workout.version })).status, 200);
    const completed = await me();
    assert.equal(completed.workout.recap.entries[0].status, 'completed');
    assert.equal(completed.workout.recap.entries[0].logged, 0);
    assert.deepEqual(completed.workoutHistory.find(row => row.day === '2020-01-01').data, priorWorkout);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
