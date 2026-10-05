import test from 'node:test';
import assert from 'node:assert/strict';
import {trainingOutlook} from './public/coach-brief.js';
import {trainingContext} from './training.js';
import {validWorkout} from './security.js';
test('five-day outlook crosses leap day and year boundary without browser timezone shifts',()=>{
 const days=trainingOutlook('2028-02-28',{preferredDays:[1,3,5]});assert.deepEqual(days.map(d=>d.day),['2028-02-28','2028-02-29','2028-03-01','2028-03-02','2028-03-03']);assert.equal(days[0].preference,'Preferred training day');assert.equal(days[1].preference,'Recovery preference');assert.equal(trainingOutlook('2026-12-30')[4].day,'2027-01-03');assert.deepEqual(trainingOutlook('2026-02-30'),[]);assert.equal(trainingOutlook('2026-10-04')[0].preference,'Choose after check-in');
});
test('feedback uses most recent past completed session only, expires and does not alter rows',()=>{
 const rows=[{day:'2026-10-01',status:'completed',data:{feedback:'too-hard'}},{day:'2026-10-03',status:'completed',data:{feedback:'comfortable'}},{day:'2026-10-05',status:'completed',data:{feedback:'too-hard'}}];const original=structuredClone(rows);
 assert.equal(trainingContext(rows,'2026-10-04').recentFeedback,'comfortable');assert.deepEqual(rows,original);assert.equal(trainingContext(rows,'2026-10-14').recentFeedback,null);assert.equal(trainingContext([rows[0]],'2026-10-04',{trainedYesterday:'no'}).recentFeedback,'too-hard');assert.equal(trainingContext([{...rows[1],status:'active'}],'2026-10-04').recentFeedback,null);
});
test('workout feedback is optional and limited to known responses',()=>{
 for(const feedback of [undefined,'','comfortable','challenging','too-hard'])assert.equal(validWorkout({exercises:[],feedback}),true);
 for(const feedback of ['anything',{},12])assert.equal(validWorkout({exercises:[],feedback}),false);
});
