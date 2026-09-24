const dayDate=day=>new Date(day+'T12:00:00Z');
const iso=date=>date.toISOString().slice(0,10);
const addDays=(day,count)=>{const date=dayDate(day);date.setUTCDate(date.getUTCDate()+count);return iso(date)};
export function weekBounds(day){const date=dayDate(day),offset=(date.getUTCDay()+6)%7;return {start:addDays(day,-offset),end:addDays(day,6-offset)}}
const weightIn=(value,unit,target)=>unit===target?Number(value):target==='kg'?Number(value)/2.2046226218:Number(value)*2.2046226218;
const waistIn=(value,unit,target)=>unit===target?Number(value):target==='cm'?Number(value)*2.54:Number(value)/2.54;
function measurementTrend(kind,measurements,reviews,start,end,target){
  const days=new Map();
  for(const row of measurements){const day=String(row.measured_at).slice(0,10);if(row.kind===kind&&day>=start&&day<=end)days.set(day,{value:kind==='weight'?weightIn(row.value,row.unit,target):waistIn(row.value,row.unit,target),unit:target})}
  for(const review of reviews){const value=review[kind];if(value!=null&&review.day>=start&&review.day<=end)days.set(review.day,{value:kind==='weight'?weightIn(value,review.weightUnit,target):waistIn(value,review.waistUnit,target),unit:target})}
  const values=[...days.entries()].sort(([a],[b])=>a.localeCompare(b));return {days:values.length,first:values.length?Number(values[0][1].value.toFixed(1)):null,last:values.length?Number(values.at(-1)[1].value.toFixed(1)):null,unit:target};
}
export function weeklyReview({week,today,workouts=[],reviews=[],activities=[],measurements=[],profile={}}){
  const {start,end}=weekBounds(week),elapsed=Math.max(0,Math.min(7,Math.round((dayDate(today)-dayDate(start))/86400000)+1));
  const inWeek=day=>day>=start&&day<=end;
  const weekWorkouts=workouts.filter(row=>inWeek(row.day)),weekReviews=reviews.filter(row=>inWeek(row.day));
  const stepDays=new Map();for(const activity of activities.filter(row=>inWeek(row.day)&&row.steps!=null))stepDays.set(activity.day,(stepDays.get(activity.day)||0)+Number(activity.steps));
  for(const review of weekReviews)if(review.steps!=null)stepDays.set(review.day,Number(review.steps));
  const stepValues=[...stepDays.values()];
  const food={onTrack:0,partly:0,offTrack:0,days:0};for(const review of weekReviews)if(['on track','partly','off track'].includes(review.food)){food.days++;food[review.food==='on track'?'onTrack':review.food==='partly'?'partly':'offTrack']++}
  const performance=new Map();for(const workout of [...weekWorkouts].sort((a,b)=>a.day.localeCompare(b.day)))for(const exercise of workout.data.exercises||[])for(const set of exercise.sets||[]){if(set.weight==null||set.weight===''||set.reps==null||set.reps==='')continue;const key=[exercise.name,set.equipmentProfileId||'unlabelled',set.unit||''].join('|');if(!performance.has(key))performance.set(key,new Map());performance.get(key).set(workout.day,{name:exercise.name,equipmentProfileId:set.equipmentProfileId||null,unit:set.unit||'',weight:Number(set.weight),reps:Number(set.reps),day:workout.day})}
  const strength=[...performance.values()].filter(days=>days.size>=2).map(days=>{const rows=[...days.values()];return {name:rows[0].name,equipmentProfileId:rows[0].equipmentProfileId,first:rows[0],last:rows.at(-1)}}).slice(0,8);
  return {start,end,elapsedDays:elapsed,workouts:{completed:weekWorkouts.filter(row=>row.status==='completed').length,active:weekWorkouts.filter(row=>row.status==='active').length,plannedRest:weekReviews.filter(row=>row.workout==='planned rest').length},steps:{days:stepDays.size,average:stepValues.length?Math.round(stepValues.reduce((a,b)=>a+b,0)/stepValues.length):null},weight:measurementTrend('weight',measurements,weekReviews,start,end,profile.units||'lb'),waist:measurementTrend('waist',measurements,weekReviews,start,end,profile.waistUnit||'in'),food,strength,note:stepDays.size<3&&weekReviews.length<3?'Several days are unrecorded. Keep logging before drawing conclusions or changing targets.':'Review your recovery and consistency; no automatic calorie or exercise change is made from one reading.'};
}
