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
