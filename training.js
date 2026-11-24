import { catalogAlternatives, exerciseCatalogAttribution, exerciseCatalogSourceUrl } from './exercise-catalog.js';

const movement=(name,pattern,muscles,cue,alternatives,substitutions=[])=>({name,pattern,muscles,cue,alternatives,substitutions,sets:3,reps:'8–12',rest:'90 sec'});

const lift = (name, pattern, muscles, sets, reps, rest = '120 sec') => ({
  name, pattern, muscles, sets, reps, rest
});
const pulldown = lift('Lat pulldowns or pull-ups', 'pull', 'back', 3, '8–10');
const row = lift('Seated rows', 'pull', 'back', 3, '10–12');
const lateralRaise = lift('Lateral raises', 'strength', 'shoulders', 3, '12–15', '60 sec');
const lower = [
  lift('Leg press', 'squat', 'quads and glutes', 3, '10–12'),
  lift('Romanian deadlifts', 'hinge', 'hamstrings and glutes', 3, '8–10'),
  lift('Leg curls', 'strength', 'hamstrings', 3, '12–15', '60 sec'),
  lift('Calf raises', 'ankle', 'calves', 4, '12–15', '60 sec')
];
export const gymRoutine = [
  { day: 1, name: 'Push', exercises: [
    lift('Bench press', 'push', 'chest and triceps', 4, '6–8'),
    lift('Incline dumbbell press', 'push', 'upper chest', 3, '8–10'),
    lift('Shoulder press', 'push', 'shoulders and triceps', 3, '8–10'),
    lateralRaise,
    lift('Triceps pushdowns', 'strength', 'triceps', 3, '12–15', '60 sec')
  ] },
  { day: 2, name: 'Pull', exercises: [
    pulldown,
    row,
    lift('Face pulls', 'pull', 'rear shoulders and upper back', 3, '12–15', '60 sec'),
    lift('Biceps curls', 'strength', 'biceps', 3, '10–12', '60 sec'),
    lift('Hammer curls', 'strength', 'biceps and forearms', 3, '10–12', '60 sec')
  ] },
  { day: 3, name: 'Legs', exercises: [
    lift('Squats', 'squat', 'quads and glutes', 4, '6–8'),
    ...lower
  ] },
  { day: 4, name: 'Rest', exercises: [] },
  { day: 5, name: 'Upper', exercises: [
    lift('Incline dumbbell press', 'push', 'upper chest', 3, '10–12'),
    row,
    lift('Shoulder press', 'push', 'shoulders and triceps', 3, '10–12'),
    pulldown,
    lateralRaise
  ] },
  { day: 6, name: 'Lower', exercises: lower },
  { day: 7, name: 'Rest', exercises: [] }
];

export function validGymDay(day) {
  return Number.isInteger(day) && day >= 1 && day <= gymRoutine.length;
}

export function defaultGymDay(date) {
  return new Date(`${date}T12:00:00Z`).getUTCDay() || 7;
}

export function gymWorkoutPlan(routineDay, check) {
  const { name, exercises } = gymRoutine[routineDay - 1];
  const title = `Day ${routineDay} · ${name}`;
  const base = { routineDay, title, cardio: null };
  if (!exercises.length || check.gym === 'no') {
    return {
      ...base, kind: 'routine-rest', exercises: [],
      reason: exercises.length ? 'This session uses gym equipment.' : 'No exercises scheduled.',
      safety: ''
    };
  }
  return {
    ...base, kind: 'strength', exercises, reason: '',
    safety: 'Use a comfortable load and range of motion. Stop if movement causes pain or symptoms.'
  };
}

export function matchesGymPlan(workout, plan) {
  return workout.exercises.length === plan.exercises.length &&
    workout.exercises.every((exercise, index) => (
      !exercise.unplanned &&
      (exercise.slot == null || exercise.slot === index) &&
      exercise.name === plan.exercises[index].name &&
      exercise.pattern === plan.exercises[index].pattern &&
      (exercise.checkedOff === undefined || typeof exercise.checkedOff === 'boolean')
    ));
}

const moves={
  squat:movement('Leg press or sit-to-stand','squat','legs','Use a comfortable range, move with control, and exhale as you stand.','Choose a squat-pattern alternative.',[
    {name:'Sit-to-stand from a stable chair',pattern:'squat',muscles:'legs',equipment:'bodyweight'},
    {name:'Goblet squat to a bench',pattern:'squat',muscles:'legs',equipment:'commercial gym'}]),
  hinge:movement('Glute bridge','hinge','glutes','Use a comfortable range and exhale as you lift without arching your back.','Choose a comfortable hip-extension alternative.',[
    {name:'Glute bridge',pattern:'hinge',muscles:'glutes',equipment:'bodyweight'},
    {name:'Dumbbell Romanian deadlift',pattern:'hinge',muscles:'hamstrings/glutes',equipment:'commercial gym'}]),
  push:movement('Chest press or incline push-up','push','chest/shoulders','Keep shoulders comfortable and exhale as you press.','Choose another push-pattern option; emphasis can differ.',[
    {name:'Incline push-up',pattern:'push',muscles:'chest/shoulders',equipment:'bodyweight'},
    {name:'Machine chest press',pattern:'push',muscles:'chest/shoulders',equipment:'commercial gym'},
    {name:'Dumbbell chest press',pattern:'push',muscles:'chest/shoulders',equipment:'commercial gym'}]),
  pull:movement('Seated row','pull','back','Pull elbows toward ribs with control; breathe continuously.','Cable row with a comfortable grip.',[
    {name:'Chest-supported machine row',pattern:'pull',muscles:'back',equipment:'commercial gym'},
    {name:'Cable row with a comfortable grip',pattern:'pull',muscles:'back',equipment:'commercial gym'}]),
  upper2:movement('Wall or incline push-up','push','chest/shoulders','Choose a stable surface and a comfortable incline; exhale as you press.','Machine chest press if available.',[
    {name:'Wall push-up',pattern:'push',muscles:'chest/shoulders',equipment:'bodyweight'},
    {name:'Machine chest press',pattern:'push',muscles:'chest/shoulders',equipment:'commercial gym'}]),
  pull2:movement('Cable row with a comfortable grip','pull','back','Pull toward ribs with control; breathe continuously.','Use a row variation with secure equipment.',[
    {name:'Seated row',pattern:'pull',muscles:'back',equipment:'commercial gym'},
    {name:'Chest-supported machine row',pattern:'pull',muscles:'back',equipment:'commercial gym'}]),
  squat2:movement('Sit-to-stand from a bench','squat','legs','Use a stable bench; stand with control and exhale.','Leg press with a comfortable range.',[
    {name:'Leg press',pattern:'squat',muscles:'legs',equipment:'commercial gym'},
    {name:'Sit-to-stand from a stable chair',pattern:'squat',muscles:'legs',equipment:'bodyweight'}]),
  calf:movement('Supported calf raise','ankle','calves','Hold a stable support; rise and lower slowly while breathing continuously.','Skip if balance or ankle comfort is uncertain.')
};

const templates={
  3:[
    {title:'Full-body A',keys:['squat','push','pull']},
    {title:'Full-body B',keys:['hinge','upper2','pull2']},
    {title:'Full-body C',keys:['squat2','push','hinge']}
  ],
  4:[
    {title:'Upper-body A',keys:['push','pull']},
    {title:'Lower-body A',keys:['squat','hinge']},
    {title:'Upper-body B',keys:['upper2','pull2']},
    {title:'Lower-body B',keys:['squat2','hinge','calf']}
  ]
};

export function validSchedule(profile={}){
  const schedule=Number(profile.schedule||3),days=profile.preferredDays??[];
  return [3,4].includes(schedule)&&Array.isArray(days)&&[0,schedule].includes(days.length)&&new Set(days).size===days.length&&days.every(day=>Number.isInteger(day)&&day>=0&&day<=6);
}

export function trainingTemplate(profile={},context={},sets=3){
  const schedule=Number(profile.schedule)===4?4:3;
  const previous=context.lastTemplate;
  let index=previous?.schedule===schedule&&Number.isInteger(previous.index)?(previous.index+1)%schedule:0;
  // Older workouts predate saved template snapshots. Infer their closest pattern
  // so the first post-upgrade session doesn't restart on the same routine.
  if(!(previous?.schedule===schedule&&Number.isInteger(previous.index))&&Array.isArray(context.lastPatterns)&&context.lastPatterns.length){
    const prior=new Set(context.lastPatterns),scores=templates[schedule].map(template=>template.keys.filter(key=>prior.has(moves[key].pattern)).length),best=Math.max(...scores),match=scores.indexOf(best);
    if(best>0)index=(match+1)%schedule;
  }
  const selected=templates[schedule][index];
  const home=String(profile.equipment||'').toLowerCase().includes('home');
  const yesterday=new Set(context.lastExerciseNames||[]);
  const exercises=selected.keys.filter(key=>!(home&&key.startsWith('pull'))).map(key=>{
    const base=moves[key].substitutions.filter(option=>!home||option.equipment==='bodyweight');
    const external=catalogAlternatives(moves[key].pattern,{home});
    const unique=[...base,...external].filter((option,index,list)=>list.findIndex(candidate=>candidate.name.toLowerCase()===option.name.toLowerCase())===index);
    const planned=moves[key];
    const fresh=yesterday.has(planned.name.toLowerCase())?unique.find(option=>option.pattern===planned.pattern&&!yesterday.has(option.name.toLowerCase())):null;
    return{...planned,...(fresh?{name:fresh.name,muscles:fresh.muscles||planned.muscles,cue:fresh.cue||planned.cue,equipment:fresh.equipment,source:fresh.source,sourceId:fresh.sourceId,license:fresh.license}:{}),substitutions:unique,sets};
  });
  return{template:{schedule,index},title:selected.title,exercises,catalogAttribution:exercises.some(exercise=>exercise.substitutions.some(option=>option.source==='ExerciseAPI'))?{text:exerciseCatalogAttribution,url:exerciseCatalogSourceUrl}:null};
}

// Older saved plans may predate the optional catalog. Decorate only the response;
// never regenerate a confirmed plan or rewrite its prescribed work.
export function withCatalogOptions(plan,profile={},check={}){
  if(!plan||!Array.isArray(plan.exercises))return plan;
  const home=check.gym==='no'||String(profile.equipment||'').toLowerCase().includes('home');
  const exercises=plan.exercises.map(exercise=>{
    const existing=(exercise.substitutions||[]).filter(option=>!home||option.source!=='ExerciseAPI');
    const options=[...existing,...catalogAlternatives(exercise.pattern,{home})];
    return{...exercise,substitutions:options.filter((option,index)=>options.findIndex(other=>other.name.toLowerCase()===option.name.toLowerCase())===index)};
  });
  const sourced=exercises.some(exercise=>exercise.substitutions.some(option=>option.source==='ExerciseAPI'));
  return{...plan,exercises,catalogAttribution:sourced?{text:exerciseCatalogAttribution,url:exerciseCatalogSourceUrl}:null};
}

// Cycle whole-workout choices without changing movement patterns, sets, or cardio.
// An old confirmed plan can use this without regenerating its prescription.
export function alternateWorkoutPlan(plan,profile={},check={},previousNames=[]){
  if(!plan||!Array.isArray(plan.exercises))return null;
  const home=check.gym==='no'||String(profile.equipment||'').toLowerCase().includes('home');
  const decorated=withCatalogOptions(plan,profile,check);
  const base=plan.variationBase||decorated.exercises;
  const previous=new Set(previousNames.map(name=>String(name).toLowerCase()));
  const index=(Number(plan.variationIndex)||0)+1;
  let changed=false,unsafeEquipment=false;
  const exercises=base.map((exercise,slot)=>{
    if(exercise.pattern==='cardio')return decorated.exercises[slot];
    const options=[exercise,...(exercise.substitutions||[])].filter(option=>option.pattern===exercise.pattern&&(!home||option.equipment==='bodyweight'));
    const unique=options.filter((option,i)=>options.findIndex(other=>other.name.toLowerCase()===option.name.toLowerCase())===i);
    const fresh=unique.filter(option=>!previous.has(option.name.toLowerCase()));
    const pool=fresh.length?fresh:unique;
    if(!pool.length){if(home)unsafeEquipment=true;return decorated.exercises[slot]}
    if(pool.length<2&&pool[0]?.name===decorated.exercises[slot]?.name)return decorated.exercises[slot];
    const choice=pool[(index-(pool[0]?.name===exercise.name?0:1)+pool.length)%pool.length];
    if(choice.name!==decorated.exercises[slot]?.name)changed=true;
    return{...exercise,name:choice.name,muscles:choice.muscles||exercise.muscles,cue:choice.cue||exercise.cue,equipment:choice.equipment,source:choice.source,sourceId:choice.sourceId,license:choice.license,substitutions:exercise.substitutions};
  });
  if(unsafeEquipment||!changed)return null;
  const variationReasonBase=plan.variationReasonBase||plan.reason;
  return{...plan,exercises,variationBase:base,variationIndex:index,variationReasonBase,reason:`${variationReasonBase} You chose a different exercise mix; movement patterns, sets, cardio and safety guidance stay the same.`};
}

export function trainingContext(rows=[],day,check={}){
  const logged=[...rows].sort((a,b)=>b.day.localeCompare(a.day)).filter(row=>row.day<day&&(row.status==='completed'||row.data?.exercises?.some(exercise=>exercise.sets?.length)));
  const current=Date.parse(`${day}T12:00:00Z`);
  const daysSinceLastWorkout=logged[0]?Math.floor((current-Date.parse(`${logged[0].day}T12:00:00Z`))/86400000):null;
  const lastTemplate=logged[0]?.data?.planSnapshot?.template;
  const lastSession=logged[0],snapshotExercises=lastSession?.data?.planSnapshot?.exercises,sourceExercises=Array.isArray(snapshotExercises)?snapshotExercises:lastSession?.data?.exercises||[];
  const lastPatterns=sourceExercises.filter(exercise=>!exercise.unplanned).map(exercise=>exercise.pattern).filter(pattern=>['squat','hinge','push','pull','ankle'].includes(pattern));
  const lastExerciseNames=(lastSession?.data?.exercises||[]).filter(exercise=>!exercise.unplanned).map(exercise=>String(exercise.name||'').toLowerCase()).filter(Boolean);
  return{
    daysSinceLastWorkout:check.trainedYesterday==='yes'?1:check.trainedYesterday==='no'?null:daysSinceLastWorkout,
    sessionsInLast7:logged.filter(row=>{const diff=current-Date.parse(`${row.day}T12:00:00Z`);return diff>=0&&diff<=6*86400000}).length,
    lastTemplate,lastPatterns,lastExerciseNames,
    recentFeedback:daysSinceLastWorkout>0&&daysSinceLastWorkout<=7&&lastSession?.status==='completed'?lastSession.data?.feedback:null
  };
}
