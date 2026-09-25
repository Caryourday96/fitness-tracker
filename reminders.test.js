import test from 'node:test';
import assert from 'node:assert/strict';
import { reminderDue } from './public/reminders.js';

test('in-app reminder follows the saved time zone and waits for an unfinished check-in',()=>{
  const now=new Date('2026-09-24T22:05:00Z');
  const profile={timezone:'America/Toronto',reminderInApp:true,reminderTime:'18:00'};
  assert.equal(reminderDue(profile,null,'2026-09-24',now),true);
  assert.equal(reminderDue({...profile,reminderTime:'18:30'},null,'2026-09-24',now),false);
  assert.equal(reminderDue(profile,{},'2026-09-24',now),false);
  assert.equal(reminderDue({...profile,reminderInApp:false},null,'2026-09-24',now),false);
  assert.equal(reminderDue(profile,null,'2026-09-23',now),false);
});
