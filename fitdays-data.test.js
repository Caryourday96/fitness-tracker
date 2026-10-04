import test from 'node:test';import assert from 'node:assert/strict';import {workoutCalendar,consistencyInsights} from './public/fitdays-data.js';
test('rolling year includes oldest partial month and current month first',()=>{const x=workoutCalendar({today:'2026-10-04',days:['2025-10-05','2025-10-04','2026-10-04','2026-10-04','2026-10-05','invalid']});assert.equal(x.start,'2025-10-05');assert.equal(x.year,2);assert.equal(x.week,1);assert.equal(x.calendarYear,1);assert.equal(x.months.length,13);assert.deepEqual(x.months[0],{year:2026,month:9});assert.deepEqual(x.months.at(-1),{year:2025,month:9});});
test('leap date and rolling counts use calendar dates',()=>{const x=workoutCalendar({today:'2024-03-01',days:['2024-02-29','2024-02-30','2024-02-23','2024-02-24']});assert.equal(x.year,3);assert.equal(x.week,2);assert.throws(()=>workoutCalendar({today:'2024-02-30',days:[]}));});

test('calendar week starts Monday and month comparisons use elapsed dates',()=>{const x=consistencyInsights({today:'2026-10-04',days:['2026-09-28','2026-09-30','2026-10-03','2026-10-03','2026-09-03','2026-09-20']});assert.equal(x.week.start,'2026-09-28');assert.equal(x.week.count,3);assert.equal(x.current.count,1);assert.equal(x.previousComparable.end,'2026-09-04');assert.equal(x.previousComparable.count,1);assert.equal(x.previousFull.count,4);});
test('previous comparable month clamps to its real last day',()=>{const x=consistencyInsights({today:'2024-03-31',days:['2024-02-29']});assert.equal(x.currentComparable.end,'2024-03-29');assert.equal(x.previousComparable.end,'2024-02-29');assert.equal(x.previousComparable.count,1);});

import {recordedMilestone,weeklyCounts} from './public/fitdays-data.js';
test('milestones recompute from current available count, including corrections',()=>{assert.equal(recordedMilestone(9),null);assert.equal(recordedMilestone(10),10);assert.equal(recordedMilestone(100),100);assert.equal(recordedMilestone(49),25)});
test('weekly counts use Monday ranges, duplicate filtering and a partial current week',()=>{const weeks=weeklyCounts({today:'2026-10-07',days:['2026-10-05','2026-10-05','2026-10-07','2026-10-08','2026-09-30']});assert.equal(weeks.length,8);assert.deepEqual(weeks.at(-1),{start:'2026-10-05',end:'2026-10-07',count:2,partial:true});assert.equal(weeks.at(-2).count,1)});

import {periodCalendar} from './public/fitdays-data.js';
test('period windows include exact cutoff and exclude older duplicate dates',()=>{const data={today:'2026-10-04',days:['2026-09-05','2026-09-04','2026-09-05','2026-10-04']};const c=periodCalendar(data,30);assert.equal(c.start,'2026-09-05');assert.equal(c.days.size,2);assert.throws(()=>periodCalendar(data,31))});

import {monthlyRecaps} from './public/fitdays-data.js';
test('monthly recap portions reconcile and label partial coverage',()=>{const m=monthlyRecaps({today:'2026-10-04',days:['2026-10-01','2026-10-04','2026-09-03']});assert.equal(m[0].count,2);assert.equal(m[0].partial,true);assert.equal(m[0].weeks.reduce((sum,w)=>sum+w.count,0),2);assert.equal(m[1].partial,false);assert.equal(m.at(-1).partial,true)});

import {recordedBests} from './public/fitdays-data.js';
test('recorded bests exclude partial months, handle ties and recompute corrections',()=>{const input={today:'2026-10-04',days:['2026-08-03','2026-09-03','2026-10-01','2026-10-02']};const best=recordedBests(input);assert.deepEqual(best.months.map(m=>m.key),['2026-09','2026-08']);assert.equal(best.fourWeeks.count,2);assert.ok(best.fourWeekTies>0);assert.equal(recordedBests({...input,days:[]}).fourWeeks,null);assert.equal(recordedBests({...input,days:[]}).months.length,0)});

import {challengeSummary} from './public/fitdays-data.js';
test('challenge counts available unique dates and never changes records',()=>{const data={today:'2026-10-04',days:['2026-10-01','2026-10-01','2026-10-03']},goal={start:'2026-10-01',end:'2026-10-30',target:12,paused:false};const info=challengeSummary(data,goal);assert.equal(info.count,2);assert.equal(info.partial,true);assert.equal(challengeSummary(data,{...goal,paused:true}).paused,true);assert.throws(()=>challengeSummary(data,{...goal,target:40}));assert.throws(()=>challengeSummary(data,{...goal,start:'2026-02-30'}));assert.equal(data.days.length,3)});

import {yearRecaps} from './public/fitdays-data.js';
test('year recap never calls rolling365 a complete leap year',()=>{const leap=yearRecaps({today:'2024-12-31',days:['2024-01-01','2024-02-29']});assert.equal(leap[0].start,'2024-01-02');assert.equal(leap[0].coveredDays,365);assert.equal(leap[0].complete,false);assert.equal(leap[0].count,1);assert.equal(yearRecaps({today:'2025-12-31',days:[]})[0].complete,true)});

import {calendarExport} from './public/fitdays-data.js';
test('calendar export has stable unique all-day IDs and leap/year date semantics',()=>{const input={today:'2025-01-01',days:['2024-02-29','2024-02-29','2024-12-31','2025-01-01']};const text=calendarExport(input);assert.equal(text.match(/BEGIN:VEVENT/g).length,3);assert.match(text,/UID:fitdays-2024-02-29@adeticket.com/);assert.match(text,/DTSTART;VALUE=DATE:20240229\r\nDTEND;VALUE=DATE:20240301/);assert.match(text,/DTSTART;VALUE=DATE:20241231\r\nDTEND;VALUE=DATE:20250101/);assert.deepEqual(text.match(/UID:[^\r]+/g),calendarExport({...input,days:[...input.days].reverse()}).match(/UID:[^\r]+/g));assert.equal(calendarExport(input,30).match(/BEGIN:VEVENT/g).length,2)});
