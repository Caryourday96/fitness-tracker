import test from 'node:test';
import assert from 'node:assert/strict';
import {progressChartData} from './public/progress-charts.js';

test('progress charts keep missing step and workout days empty and prefer reviewed steps',()=>{
  const data=progressChartData({
    reviews:[{day:'2026-09-24',steps:6200}],
    activities:[{day:'2026-09-24',steps:4000},{day:'2026-09-23',steps:5100}],
    workouts:[{day:'2026-09-24',status:'completed',data:{exercises:[]}}]
  },'2026-09-24',3);
  assert.deepEqual(data.steps.map(p=>p?.value??null),[null,5100,6200]);
  assert.deepEqual(data.workoutDays.map(p=>p?.value??null),[null,null,1]);
  assert.deepEqual(data.coverage,{stepDays:2,workoutDays:1});
});

test('comparable load history groups by exercise, equipment profile and unit',()=>{
  const workout=(day,profile,unit,weight)=>({day,status:'completed',data:{exercises:[{name:'Chest press',sets:[{weight,reps:10,unit,equipmentProfileId:profile}]}]}});
  const data=progressChartData({workouts:[workout('2026-09-23',4,'lb',40),workout('2026-09-24',4,'lb',45),workout('2026-09-24',5,'lb',80),workout('2026-09-24',4,'kg',20)]},'2026-09-24',3);
  assert.equal(data.strength.length,1);
  assert.equal(data.strength[0].profile,'Equipment profile 4');
  assert.equal(data.strength[0].unit,'lb');
  assert.deepEqual(data.strength[0].points.map(p=>p?.value??null),[null,40,45]);
});
