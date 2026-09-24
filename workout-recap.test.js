import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeWorkout } from './public/workout-recap.js';

test('recap separates complete, partial, skipped and cardio work',()=>{
  const plan={exercises:[{name:'Row',pattern:'strength',sets:2},{name:'Press',pattern:'strength',sets:3},{name:'Treadmill',pattern:'cardio'}]};
  const workout={startedAt:'2026-09-24T12:00:00.000Z',exercises:[{name:'Row',sets:[{reps:10},{reps:10}]},{name:'Press',sets:[{reps:8}]},{name:'Treadmill',sets:[{duration:12}] }]};
  const recap=summarizeWorkout(plan,workout,'2026-09-24T12:45:00.000Z');
  assert.deepEqual(recap.counts,{completed:2,partial:1,skipped:0});
  assert.equal(recap.cardioMinutes,12);
  assert.equal(recap.durationMinutes,45);
  assert.equal(recap.entries[1].status,'partial');
  assert.equal(workout.recap,undefined);
});

test('missing sets stay skipped and missing start time is not invented',()=>{
  const recap=summarizeWorkout({exercises:[{name:'Walk',pattern:'cardio'}]},{exercises:[{name:'Walk',sets:[]}]},'2026-09-24T12:45:00.000Z');
  assert.equal(recap.entries[0].status,'skipped');
  assert.equal(recap.durationMinutes,null);
});
