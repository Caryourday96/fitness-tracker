const valid = day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day)) && new Date(day).toISOString().slice(0,10) === day;
export function workoutCalendar(data) {
 if (!valid(data.today) || !Array.isArray(data.days)) throw Error('Workout dates could not be read. Please refresh.');
 const today=new Date(data.today+'T12:00:00Z'),start=new Date(today);start.setUTCDate(start.getUTCDate()-364);
 const first=start.toISOString().slice(0,10),days=new Set(data.days.filter(day=>valid(day)&&day>=first&&day<=data.today));
 const months=[];const cursor=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),1));
 const oldest=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),1));
 while(cursor>=oldest){months.push({year:cursor.getUTCFullYear(),month:cursor.getUTCMonth()});cursor.setUTCMonth(cursor.getUTCMonth()-1)}
 const count=length=>[...days].filter(day=>Date.parse(day+'T12:00:00Z')>=today.getTime()-(length-1)*86400000).length;
 return {today:data.today,start:first,days,months,week:count(7),month:count(30),year:days.size,calendarYear:[...days].filter(day=>day.slice(0,4)===data.today.slice(0,4)).length};
}

export function consistencyInsights(data) {
 const calendar=workoutCalendar(data),today=new Date(data.today+'T12:00:00Z');
 const iso=date=>date.toISOString().slice(0,10),count=(from,to)=>[...calendar.days].filter(day=>day>=from&&day<=to).length;
 const monday=new Date(today);monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);
 const monthStart=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),1));
 const previousStart=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth()-1,1));
 const previousEnd=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),0));
 const currentComparableEnd=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),Math.min(today.getUTCDate(),previousEnd.getUTCDate())));
 const comparableEnd=new Date(Date.UTC(previousStart.getUTCFullYear(),previousStart.getUTCMonth(),Math.min(today.getUTCDate(),previousEnd.getUTCDate())));
 return {week:{start:iso(monday),end:data.today,count:count(iso(monday),data.today)},current:{start:iso(monthStart),end:data.today,count:count(iso(monthStart),data.today)},currentComparable:{start:iso(monthStart),end:iso(currentComparableEnd),count:count(iso(monthStart),iso(currentComparableEnd))},previousComparable:{start:iso(previousStart),end:iso(comparableEnd),count:count(iso(previousStart),iso(comparableEnd))},previousFull:{start:iso(previousStart),end:iso(previousEnd),count:count(iso(previousStart),iso(previousEnd))}};
}

export function recordedMilestone(count){return [10,25,50,100].filter(n=>n<=count).at(-1)||null}
export function weeklyCounts(data){const calendar=workoutCalendar(data),today=new Date(data.today+'T12:00:00Z');const monday=new Date(today);monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);return Array.from({length:8},(_,index)=>{const start=new Date(monday);start.setUTCDate(start.getUTCDate()-(7-index)*7);const end=new Date(start);end.setUTCDate(end.getUTCDate()+6);const a=start.toISOString().slice(0,10),b=end.toISOString().slice(0,10),coveredEnd=b>data.today?data.today:b;return {start:a,end:coveredEnd,count:[...calendar.days].filter(day=>day>=a&&day<=coveredEnd).length,partial:b>data.today}})}
