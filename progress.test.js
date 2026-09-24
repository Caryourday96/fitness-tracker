import test from 'node:test';
import assert from 'node:assert/strict';
import {validDay,weightTrend} from './progress.js';
test('calendar dates reject rollover and malformed values',()=>{assert.equal(validDay('2026-02-30'),false);assert.equal(validDay('2026-09-24'),true);assert.equal(validDay('../data'),false)});
test('missing weights remain missing and duplicate readings do not overweight a day',()=>{
 assert.deepEqual(weightTrend([],'2026-09-24'),{kg:null,days:0,sparse:true});
 const rows=[{kind:'weight',value:100,unit:'kg',measured_at:'2026-09-24'},{kind:'weight',value:102,unit:'kg',measured_at:'2026-09-24'},{kind:'weight',value:99,unit:'kg',measured_at:'2026-09-23'},{kind:'weight',value:300,unit:'kg',measured_at:'2026-09-01'}];
 assert.deepEqual(weightTrend(rows,'2026-09-24'),{kg:100,days:2,sparse:true});
});
