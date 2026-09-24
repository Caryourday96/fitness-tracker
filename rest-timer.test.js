import test from 'node:test';
import assert from 'node:assert/strict';
import {restSeconds} from './public/rest-timer.js';

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
