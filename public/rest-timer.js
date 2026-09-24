export function restSeconds(timer,now=Date.now()){
  if(!timer)return 0;
  if(timer.paused)return Math.max(0,Math.ceil(Number(timer.remaining)||0));
  const deadline=Number(timer.deadline);if(!Number.isFinite(deadline))return 0;
  return Math.max(0,Math.ceil((deadline-now)/1000));
}
