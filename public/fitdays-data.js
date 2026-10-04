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

export function periodCalendar(data,length=365){if(![7,30,90,365].includes(Number(length)))throw Error('Unsupported record window');const base=workoutCalendar(data),start=new Date(data.today+'T12:00:00Z');start.setUTCDate(start.getUTCDate()-(Number(length)-1));const first=start.toISOString().slice(0,10);return {...base,start:first,days:new Set([...base.days].filter(day=>day>=first)),months:base.months.filter(({year,month})=>new Date(Date.UTC(year,month+1,0)).toISOString().slice(0,10)>=first)}}

export function periodWeeks(data,length){const c=periodCalendar(data,length);return weeklyCounts({today:data.today,days:[...c.days]}).filter(week=>week.end>=c.start).map(week=>({...week,start:week.start<c.start?c.start:week.start,partial:week.partial||week.start<c.start}))}

export function monthlyRecaps(data){const c=workoutCalendar(data);return c.months.map(({year,month})=>{const a=new Date(Date.UTC(year,month,1)).toISOString().slice(0,10),b=new Date(Date.UTC(year,month+1,0)).toISOString().slice(0,10),start=a<c.start?c.start:a,end=b>c.today?c.today:b;const weeks=[];const cursor=new Date(start+'T12:00:00Z');while(cursor.toISOString().slice(0,10)<=end){const from=cursor.toISOString().slice(0,10),last=new Date(cursor);last.setUTCDate(last.getUTCDate()+(7-last.getUTCDay())%7);const to=last.toISOString().slice(0,10)>end?end:last.toISOString().slice(0,10);weeks.push({start:from,end:to,count:[...c.days].filter(day=>day>=from&&day<=to).length});cursor.setTime(Date.parse(to+'T12:00:00Z'));cursor.setUTCDate(cursor.getUTCDate()+1)}return {key:year+'-'+String(month+1).padStart(2,'0'),start,end,count:[...c.days].filter(day=>day>=start&&day<=end).length,partial:start!==a||end!==b,weeks}})}

export function recordedBests(data){const c=workoutCalendar(data),complete=monthlyRecaps(data).filter(month=>!month.partial),maximum=Math.max(0,...complete.map(month=>month.count)),months=maximum?complete.filter(month=>month.count===maximum).map(({key,start,end,count})=>({key,start,end,count})):[];let best=null,ties=0;for(let stamp=Date.parse(c.start+'T12:00:00Z');stamp+27*86400000<=Date.parse(c.today+'T12:00:00Z');stamp+=86400000){const start=new Date(stamp).toISOString().slice(0,10),end=new Date(stamp+27*86400000).toISOString().slice(0,10),count=[...c.days].filter(day=>day>=start&&day<=end).length;if(count>(best?.count||0)){best={start,end,count};ties=1}else if(best&&count===best.count)ties++}return {months,fourWeeks:best,fourWeekTies:ties,start:c.start,end:c.today}}

export function challengeSummary(data,goal){if(!goal)return null;if(!valid(goal.start)||!valid(goal.end)||goal.start>goal.end||!Number.isInteger(Number(goal.target))||Number(goal.target)<1||Number(goal.target)>Math.floor((Date.parse(goal.end)-Date.parse(goal.start))/86400000)+1)throw Error('Choose valid start/end dates and a whole-day target within that period.');const c=workoutCalendar(data),start=goal.start<c.start?c.start:goal.start,end=goal.end>c.today?c.today:goal.end;return {start,end,count:[...c.days].filter(day=>day>=start&&day<=end).length,target:Number(goal.target),paused:Boolean(goal.paused),partial:goal.start<c.start||goal.end>c.today,hasCoverage:start<=end}}

export function yearRecaps(data){const c=workoutCalendar(data),first=Number(c.start.slice(0,4)),last=Number(c.today.slice(0,4));return Array.from({length:last-first+1},(_,index)=>last-index).map(year=>{const a=year+'-01-01',b=year+'-12-31',start=a<c.start?c.start:a,end=b>c.today?c.today:b;return {year,start,end,count:[...c.days].filter(day=>day>=start&&day<=end).length,coveredDays:Math.floor((Date.parse(end)-Date.parse(start))/86400000)+1,complete:start===a&&end===b}})}

export function calendarExport(data,length=365){const c=periodCalendar(data,length),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),events=[...c.days].sort().flatMap(day=>{const next=new Date(day+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);return ['BEGIN:VEVENT','UID:fitdays-'+day+'@adeticket.com','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+day.replaceAll('-',''),'DTEND;VALUE=DATE:'+next.toISOString().slice(0,10).replaceAll('-',''),'SUMMARY:Recorded workout day','DESCRIPTION:Completed workout day recorded in Fitdays. No private details.','END:VEVENT']});return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Adeticket//Fitdays//EN','CALSCALE:GREGORIAN',...events,'END:VCALENDAR',''].join('\r\n')}
