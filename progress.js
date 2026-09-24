export function validDay(day) {
  return typeof day==='string' && /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    !Number.isNaN(Date.parse(day)) && new Date(day).toISOString().slice(0,10)===day;
}
export function weightTrend(rows, end) {
  const start=new Date(end+'T12:00:00Z');start.setUTCDate(start.getUTCDate()-6);
  const first=start.toISOString().slice(0,10),days=new Map();
  for(const row of rows){const day=row.measured_at.slice(0,10);if(row.kind!=='weight'||day<first||day>end||!['lb','kg'].includes(row.unit))continue;
    const kg=row.unit==='lb'?row.value*0.45359237:row.value;
    if(Number.isFinite(kg)&&kg>0){const values=days.get(day)||[];values.push(kg);days.set(day,values)}
  }
  const averages=[...days.values()].map(v=>v.reduce((a,b)=>a+b,0)/v.length);
  return {kg:averages.length?averages.reduce((a,b)=>a+b,0)/averages.length:null,days:averages.length,sparse:averages.length<4};
}

export function activityTrend({reviews=[],activities=[],workouts=[]},end) {
  const start=new Date(end+'T12:00:00Z');start.setUTCDate(start.getUTCDate()-6);
  const first=start.toISOString().slice(0,10),days=Array.from({length:7},(_,i)=>{const d=new Date(first+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);return d.toISOString().slice(0,10)});
  const reviewByDay=new Map(reviews.map(r=>[r.day,r]));
  const activityByDay=new Map();
  for(const a of activities){if(!days.includes(a.day))continue;const current=activityByDay.get(a.day)||{steps:0,hasSteps:false,minutes:0};if(Number.isFinite(Number(a.steps))&&a.steps!==null){current.steps+=Number(a.steps);current.hasSteps=true}if(Number.isFinite(Number(a.duration))&&a.duration!==null)current.minutes+=Number(a.duration);activityByDay.set(a.day,current)}
  const workoutMinutes=new Map();
  for(const w of workouts){if(!days.includes(w.day))continue;let total=0;for(const ex of w.data?.exercises||[])for(const set of ex.sets||[])if(Number.isFinite(Number(set.duration)))total+=Number(set.duration);if(total>0)workoutMinutes.set(w.day,total)}
  const stepValues=[],minuteValues=[];
  for(const day of days){const review=reviewByDay.get(day),activity=activityByDay.get(day);if(review?.steps!==null&&review?.steps!==undefined)stepValues.push(Number(review.steps));else if(activity?.hasSteps)stepValues.push(activity.steps);const minutes=workoutMinutes.has(day)?workoutMinutes.get(day):activity?.minutes;if(minutes>0)minuteValues.push(minutes)}
  return {window:7,steps:{average:stepValues.length?Math.round(stepValues.reduce((a,b)=>a+b,0)/stepValues.length):null,days:stepValues.length,sparse:stepValues.length<4},activityMinutes:{total:minuteValues.reduce((a,b)=>a+b,0),days:minuteValues.length,sparse:minuteValues.length<4}};
}
