const atNoon=day=>new Date(`${day}T12:00:00Z`);
const iso=date=>date.toISOString().slice(0,10);

export function progressChartData({reviews=[],activities=[],workouts=[]},end,window=30){
  const first=atNoon(end);first.setUTCDate(first.getUTCDate()-(window-1));
  const days=Array.from({length:window},(_,i)=>{const day=new Date(first);day.setUTCDate(day.getUTCDate()+i);return iso(day)});
  const daySet=new Set(days),reviewByDay=new Map(reviews.filter(r=>daySet.has(r.day)).map(r=>[r.day,r]));
  const activityByDay=new Map();
  for(const row of activities){if(!daySet.has(row.day)||row.steps==null||row.steps==='')continue;const value=Number(row.steps);if(!Number.isFinite(value)||value<0)continue;activityByDay.set(row.day,(activityByDay.get(row.day)||0)+value)}
  const sessions=new Map();
  for(const row of workouts){if(!daySet.has(row.day))continue;const list=sessions.get(row.day)||[];list.push(row);sessions.set(row.day,list)}
  const steps=days.map(day=>{const review=reviewByDay.get(day);if(review?.steps!=null&&review.steps!==''){const value=Number(review.steps);return Number.isFinite(value)&&value>=0?{day,value}:null}const value=activityByDay.get(day);return value==null?null:{day,value}});
  const workoutDays=days.map(day=>{const rows=sessions.get(day);return rows?.length?{day,value:rows.length,status:rows.map(r=>r.status).join(', ')}:null});
  const performance=new Map();
  for(const row of workouts){if(!daySet.has(row.day))continue;for(const exercise of row.data?.exercises||[]){for(const set of exercise.sets||[]){if(set.weight==null||set.weight===''||set.reps==null||set.reps==='')continue;const weight=Number(set.weight),reps=Number(set.reps);if(!Number.isFinite(weight)||weight<=0||!Number.isFinite(reps)||reps<=0)continue;const unit=['lb','kg'].includes(set.unit)?set.unit:'';if(!unit)continue;const profile=set.equipmentProfileId==null?'unlabelled':String(set.equipmentProfileId);const key=[exercise.name,profile,unit].join('|');if(!performance.has(key))performance.set(key,{name:exercise.name,profile:profile==='unlabelled'?'Equipment not labelled':`Equipment profile ${profile}`,unit,byDay:new Map()});const group=performance.get(key),current=group.byDay.get(row.day);if(!current||weight>current.value)group.byDay.set(row.day,{day:row.day,value:weight,reps})}}}
  const strength=[...performance.values()].map(group=>({...group,points:days.map(day=>group.byDay.get(day)||null)})).filter(group=>group.byDay.size>=2).sort((a,b)=>b.byDay.size-a.byDay.size).slice(0,6);
  return{days,steps,workoutDays,strength,coverage:{stepDays:steps.filter(Boolean).length,workoutDays:workoutDays.filter(Boolean).length}};
}
