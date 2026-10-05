// The server supplies the day in the account's confirmed time zone.
export function trainingOutlook(day, profile={}) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day||''))return [];
  const start=new Date(day+'T12:00:00Z');
  if(!Number.isFinite(+start)||start.toISOString().slice(0,10)!==day)return [];
  const preferred=Array.isArray(profile.preferredDays)?profile.preferredDays:[];
  return Array.from({length:5},(_,index)=>{
    const date=new Date(+start+index*86400000);
    return {day:date.toISOString().slice(0,10),label:date.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'}),preference:preferred.length?(preferred.includes(date.getUTCDay())?'Preferred training day':'Recovery preference'):'Choose after check-in'};
  });
}
export function feedbackLabel(value){return ({comfortable:'Comfortable',challenging:'Challenging but manageable','too-hard':'Too hard'})[value]||'';}
