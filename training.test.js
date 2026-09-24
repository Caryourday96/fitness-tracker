import test from 'node:test';
import assert from 'node:assert/strict';
import { planFor } from './server.js';
import { trainingContext, trainingTemplate, validSchedule, withCatalogOptions } from './training.js';

test('preferred weekdays must be empty or match the distinct selected schedule',()=>{
  assert.equal(validSchedule({schedule:3,preferredDays:[]}),true);
  assert.equal(validSchedule({schedule:3,preferredDays:[1,3,5]}),true);
  assert.equal(validSchedule({schedule:4,preferredDays:[1,2,4,6]}),true);
  assert.equal(validSchedule({schedule:3,preferredDays:[1,3]}),false);
  assert.equal(validSchedule({schedule:4,preferredDays:[1,1,2,3]}),false);
  assert.equal(validSchedule({schedule:5,preferredDays:[]}),false);
});

test('three-day and four-day templates are distinct and advance from saved plan history',()=>{
  const firstThree=trainingTemplate({schedule:3},{},3);
  const nextThree=trainingTemplate({schedule:3},{lastTemplate:firstThree.template},2);
  const firstFour=trainingTemplate({schedule:4},{},3);
  assert.equal(firstThree.title,'Full-body A');
  assert.equal(nextThree.title,'Full-body B');
  assert.equal(nextThree.exercises[0].sets,2);
  assert.equal(firstFour.title,'Upper-body A');
  assert.deepEqual(firstFour.exercises.map(move=>move.pattern),['push','pull']);
  assert.notDeepEqual(firstThree.exercises.map(move=>move.pattern),firstFour.exercises.map(move=>move.pattern));
});

test('planned weekdays and safety precedence are deterministic',()=>{
  const profile={schedule:3,preferredDays:[1,3,5]}; // Monday, Wednesday, Friday.
  const rest=planFor({energy:'high',gym:'yes'},profile,'2026-09-24',{sessionsInLast7:0}); // Thursday.
  assert.equal(rest.kind,'recovery');
  assert.match(rest.reason,/preferred training weekdays/i);
  const training=planFor({energy:'high',gym:'yes',minutes:60},profile,'2026-09-25',{sessionsInLast7:0});
  assert.equal(training.template.schedule,3);
  assert.equal(training.title,'Full-body A · strength for sustainable weight loss');
  const safety=planFor({energy:'high',symptoms:'chest-pain'},profile,'2026-09-24');
  assert.equal(safety.kind,'safety-stop');
});

test('training context preserves the latest server-saved template and ignores future sessions',()=>{
  const rows=[
    {day:'2026-09-25',status:'completed',data:{exercises:[{sets:[{}]}],planSnapshot:{template:{schedule:3,index:1}}}},
    {day:'2026-09-23',status:'completed',data:{exercises:[{sets:[{}]}],planSnapshot:{template:{schedule:3,index:0}}}}
  ];
  const context=trainingContext(rows,'2026-09-24',{trainedYesterday:'not-sure'});
  assert.deepEqual(context.lastTemplate,{schedule:3,index:0});
  assert.equal(context.sessionsInLast7,1);
  assert.equal(context.daysSinceLastWorkout,1);
});

test('legacy workout pattern prevents the planner restarting with the same template',()=>{
  const rows=[{day:'2026-09-23',status:'completed',data:{exercises:[{pattern:'squat'},{pattern:'push'},{pattern:'pull'}]}}];
  const context=trainingContext(rows,'2026-09-24',{trainedYesterday:'no'});
  assert.deepEqual(context.lastPatterns,['squat','push','pull']);
  assert.equal(trainingTemplate({schedule:3},context,3).title,'Full-body B');
  assert.equal(planFor({energy:'high',gym:'yes',trainedYesterday:'yes'},{schedule:3},'2026-09-24',context).kind,'recovery');
});

test('workout mix alternatives preserve the movement pattern and home plans avoid gym machines',()=>{
  const gym=[0,1,2].map(index=>trainingTemplate({schedule:3,equipment:'commercial gym'},{lastTemplate:{schedule:3,index:(index+2)%3}},3));
  for(const plan of gym)for(const exercise of plan.exercises)for(const option of exercise.substitutions)assert.equal(option.pattern,exercise.pattern);
  assert.ok(gym.some(plan=>plan.exercises.some(exercise=>exercise.substitutions.some(option=>option.name==='Dumbbell Romanian deadlift'))));
  assert.ok(gym.some(plan=>plan.exercises.some(exercise=>exercise.substitutions.some(option=>option.source==='ExerciseAPI'&&option.equipment))));
  for(const pattern of ['squat','hinge','push','pull'])assert.ok(gym.some(plan=>plan.exercises.some(exercise=>exercise.pattern===pattern&&exercise.substitutions.filter(option=>option.source==='ExerciseAPI').length>=2)));
  assert.ok(gym.every(plan=>plan.catalogAttribution?.text.includes('CC BY 4.0')));
  const home=trainingTemplate({schedule:3,equipment:'home / walking'},{},3);
  assert.ok(home.exercises.every(exercise=>exercise.pattern!=='pull'));
  assert.ok(home.exercises.every(exercise=>exercise.substitutions.every(option=>option.source!=='ExerciseAPI')));
  assert.ok(home.exercises.every(exercise=>exercise.substitutions.every(option=>!['Machine chest press','Leg press','Dumbbell Romanian deadlift'].includes(option.name))));
  assert.equal(home.catalogAttribution,null);
});

test('older confirmed plans gain catalog choices without rewriting their saved work',()=>{
  const saved={kind:'rest-day-override',title:'Regular workout — rest-day override',exercises:[{name:'Leg press or sit-to-stand',pattern:'squat',sets:3,reps:'8–12'},{name:'Treadmill walk',pattern:'cardio',sets:1,reps:'15 min'}]};
  const result=withCatalogOptions(saved,{equipment:'commercial gym'},{gym:'yes'});
  assert.equal(result.exercises[0].sets,3);
  assert.equal(result.exercises[0].reps,'8–12');
  assert.ok(result.exercises[0].substitutions.some(option=>option.source==='ExerciseAPI'));
  assert.equal(result.exercises[1].substitutions.length,0);
  assert.match(result.catalogAttribution.text,/CC BY 4\.0/);
  assert.equal(saved.exercises[0].substitutions,undefined);
  const home=withCatalogOptions(saved,{equipment:'home / walking'},{gym:'no'});
  assert.equal(home.catalogAttribution,null);
});
