import test from 'node:test';
import assert from 'node:assert/strict';
import {validDay,weightTrend,activityTrend} from './progress.js';
test('calendar dates reject rollover and malformed values',()=>{assert.equal(validDay('2026-02-30'),false);assert.equal(validDay('2026-09-24'),true);assert.equal(validDay('../data'),false)});
test('missing weights remain missing and duplicate readings do not overweight a day',()=>{
 assert.deepEqual(weightTrend([],'2026-09-24'),{kg:null,days:0,sparse:true});
 const rows=[{kind:'weight',value:100,unit:'kg',measured_at:'2026-09-24'},{kind:'weight',value:102,unit:'kg',measured_at:'2026-09-24'},{kind:'weight',value:99,unit:'kg',measured_at:'2026-09-23'},{kind:'weight',value:300,unit:'kg',measured_at:'2026-09-01'}];
 assert.deepEqual(weightTrend(rows,'2026-09-24'),{kg:100,days:2,sparse:true});
});

test('separate walks add to cardio, repeated daily summaries do not double count',()=>{
 const day='2026-10-02',workouts=[{day,data:{exercises:[{sets:[{duration:15}]}]}}];
 const separate={day,duration:30,steps:null,minute_scope:'separate'};
 const summary={day,duration:45,steps:null,minute_scope:'daily-summary'};
 const total=activities=>activityTrend({workouts,activities},day).activityMinutes.total;
 assert.equal(total([separate]),45);assert.equal(total([summary,summary]),45);
 assert.equal(total([separate,summary,summary]),45);
 assert.equal(total([{day,duration:30,steps:null}]),15);
 assert.equal(activityTrend({activities:[summary,summary]},day).activityMinutes.total,45);
});
