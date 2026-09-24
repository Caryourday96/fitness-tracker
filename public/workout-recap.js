export function summarizeWorkout(plan,workout,completedAt=new Date().toISOString()){
  const entries=(plan?.exercises||[]).map((item,slot)=>{
    const exercises=(workout?.exercises||[]).filter((exercise,index)=>!exercise.unplanned&&(exercise.slot??index)===slot);
    const sets=exercises.flatMap(exercise=>exercise.sets||[]);
    const cardio=item.pattern==='cardio';
    const planned=cardio?1:Math.max(0,Number(item.sets)||0);
    const logged=cardio?sets.filter(set=>Number(set.duration)>0).length:sets.length;
    const status=logged===0?'skipped':logged>=planned?'completed':'partial';
    return {name:item.name,kind:cardio?'cardio':'strength',status,planned,logged,cardioMinutes:cardio?sets.reduce((total,set)=>total+(Number(set.duration)||0),0):0};
  });
  for(const exercise of workout?.exercises||[]){if(!exercise.unplanned||!(exercise.sets||[]).length)continue;const sets=exercise.sets;entries.push({name:exercise.name,kind:exercise.pattern==='cardio'?'cardio':'strength',status:'unplanned',planned:0,logged:sets.length,cardioMinutes:exercise.pattern==='cardio'?sets.reduce((total,set)=>total+(Number(set.duration)||0),0):0})}
  const counts={completed:0,partial:0,skipped:0,unplanned:0};
  for(const entry of entries)counts[entry.status]++;
  const elapsed=(Date.parse(completedAt)-Date.parse(workout?.startedAt||''))/60000;
  return {completedAt,durationMinutes:Number.isFinite(elapsed)&&elapsed>=0&&elapsed<=1440?Math.round(elapsed):null,cardioMinutes:Math.round(entries.reduce((total,entry)=>total+entry.cardioMinutes,0)),counts,entries};
}
