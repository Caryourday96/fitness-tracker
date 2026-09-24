import test from 'node:test';
import assert from 'node:assert/strict';
import { weekBounds, weeklyReview } from './weekly-review.js';

test('week bounds use Monday through Sunday',()=>{
  assert.deepEqual(weekBounds('2026-09-24'),{start:'2026-09-21',end:'2026-09-27'});
});

test('weekly review preserves sparse days and uses recorded-day averages',()=>{
  const result=weeklyReview({week:'2026-09-24',today:'2026-09-24',profile:{units:'lb',waistUnit:'in'},workouts:[{day:'2026-09-22',status:'completed',data:{exercises:[]}}],reviews:[{day:'2026-09-22',steps:5000,food:'on track',weight:250,weightUnit:'lb'},{day:'2026-09-23',steps:null,food:'partly'}],activities:[{day:'2026-09-22',steps:3000},{day:'2026-09-24',steps:7000}],measurements:[]});
  assert.equal(result.elapsedDays,4);
  assert.equal(result.steps.days,2);
  assert.equal(result.steps.average,6000);
  assert.equal(result.weight.days,1);
  assert.equal(result.food.days,2);
  assert.equal(result.workouts.completed,1);
});
