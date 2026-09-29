import test from 'node:test';
import assert from 'node:assert/strict';
import {restSeconds} from './public/rest-timer.js';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('actual start handler creates a deadline before ticking and preserves paused remaining time',()=>{
  const source=readFileSync(new URL('./public/app.js',import.meta.url),'utf8');
  const start=source.slice(source.indexOf('function startRestTimer('),source.indexOf('\nwireToday=()=>{wireTodayRestBase();'));
  const scope={restSeconds,Date:{now:()=>100_000},activeRestTimer:null,clearInterval(){},setInterval(){return 1},saveRestTimer(timer){scope.saved=timer},tickRestTimer(){scope.left=restSeconds(scope.activeRestTimer.timer,100_000)}};
  const run=runInNewContext(start+'\nstartRestTimer',scope);
  const button={},status={},skip={};
  run(button,status,90,'exercise',null,skip);
  assert.equal(scope.left,90);assert.equal(scope.saved.deadline,190_000);assert.equal(button.textContent,'Pause rest timer');assert.equal(skip.hidden,false);
  run(button,status,90,'exercise',{key:'exercise',paused:true,remaining:37},skip);
  assert.equal(scope.left,37);assert.equal(scope.saved.deadline,137_000);
  run(button,status,90,'exercise',{key:'exercise',paused:false,deadline:120_000},skip);
  assert.equal(scope.left,20);assert.equal(scope.saved.deadline,120_000);
});

test('rest timer uses an absolute deadline after app suspension and preserves paused time',()=>{
  assert.equal(restSeconds({deadline:15_000},10_200),5);
  assert.equal(restSeconds({deadline:9_000},10_200),0);
  assert.equal(restSeconds({paused:true,remaining:17},100_000),17);
  assert.equal(restSeconds({paused:true,remaining:-2},100_000),0);
  assert.equal(restSeconds(null,0),0);
});

test('rest timer completion is clamped and malformed persisted deadlines do not continue',()=>{
  assert.equal(restSeconds({deadline:12_000},12_000),0);
  assert.equal(restSeconds({deadline:'invalid'},0),0);
});
