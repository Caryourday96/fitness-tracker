import test from 'node:test';
import assert from 'node:assert/strict';
import { weekBounds, weeklyReview } from './weekly-review.js';

test('highlights cite recorded dates, separate recovery and exclude future workouts',()=>{
 const result=weeklyReview({week:'2026-10-06',today:'2026-10-06',workouts:[{day:'2026-10-05',status:'completed',data:{exercises:[]}},{day:'2026-10-07',status:'completed',data:{exercises:[]}}],reviews:[{day:'2026-10-06',workout:'planned rest',steps:4000,food:'off track'}]});
 assert.equal(result.highlights.length,3);
 assert.match(result.highlights[0],/1 completed workout day recorded: 2026-10-05/);
 assert.match(result.highlights[1],/Planned recovery recorded on 2026-10-06/);
 assert.match(result.highlights[2],/1 of 2 elapsed days/);
 assert.match(result.highlights[2],/Sparse data/);
 assert.doesNotMatch(result.highlights.join(' '),/2026-10-07|calories|compensate|burn/);
 assert.equal(result.workouts.completed,1);
});

test('empty week does not imply failure or fabricate activity',()=>{
 const result=weeklyReview({week:'2026-10-06',today:'2026-10-06'});
 assert.equal(result.highlights.length,1);
 assert.match(result.highlights[0],/Missing entries are not missed workouts/);
 assert.equal(result.steps.average,null);
});

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

test('weekly coverage counts past gaps rather than future days',()=>{
 const monday=weeklyReview({week:'2026-09-21',today:'2026-09-21',reviews:[{day:'2026-09-21',steps:4000}]});
 assert.doesNotMatch(monday.note,/Several days/);
 const wednesday=weeklyReview({week:'2026-09-23',today:'2026-09-23',reviews:[{day:'2026-09-23',steps:4000}]});
 assert.match(wednesday.note,/Several days/);
 const recorded=weeklyReview({week:'2026-09-23',today:'2026-09-23',reviews:[{day:'2026-09-21'},{day:'2026-09-22'}]});
 assert.doesNotMatch(recorded.note,/Several days/);
});
