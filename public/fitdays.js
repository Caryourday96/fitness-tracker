const calendar=document.querySelector('#calendar');
const weekdays=['S','M','T','W','T','F','S'];
const dateAtNoon=iso=>new Date(`${iso}T12:00:00Z`);
const readable=date=>new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric',timeZone:'UTC'}).format(date);
function element(tag,text,className){const node=document.createElement(tag);if(text!=null)node.textContent=text;if(className)node.className=className;return node}
function renderMonth(year,month,days,today,order){
  const section=element('section',null,'month'),title=element('h3',readable(new Date(Date.UTC(year,month,1))));section.style.setProperty('--month-order',order);section.append(title);
  const labels=element('div',null,'weekdays');labels.setAttribute('aria-hidden','true');weekdays.forEach(day=>labels.append(element('span',day,'weekday')));section.append(labels);
  const grid=element('ol',null,'days');grid.setAttribute('aria-label',`${readable(new Date(Date.UTC(year,month,1)))} calendar`);grid.style.listStyle='none';grid.style.margin='0';grid.style.padding='0';
  const first=new Date(Date.UTC(year,month,1)),count=new Date(Date.UTC(year,month+1,0)).getUTCDate();
  for(let i=0;i<first.getUTCDay();i++){const blank=element('li','','empty');blank.setAttribute('aria-hidden','true');grid.append(blank)}
  for(let day=1;day<=count;day++){const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,completed=days.has(iso),cell=element('li',String(day),`day${completed?' done':''}${iso===today?' today':''}`);cell.setAttribute('aria-label',`${readable(dateAtNoon(iso))} ${day}${completed?' · workout completed':''}${iso===today?' · today':''}`);cell.title=completed?'Workout completed':'';grid.append(cell)}
  section.append(grid);return section;
}
async function load(){
  try{
    const response=await fetch('/api/public-workout-days',{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}});
    if(!response.ok)throw Error('Workout dates could not be loaded.');
    const data=await response.json(),days=new Set(data.days||[]),today=dateAtNoon(data.today),year=today.getUTCFullYear(),month=today.getUTCMonth();
    const countSince=offset=>[...days].filter(day=>{const date=dateAtNoon(day);return date<=today&&date>=new Date(today.getTime()-offset*86400000)}).length;
    const yearCount=[...days].filter(day=>{const date=dateAtNoon(day);return date.getUTCFullYear()===year&&date<=today}).length;
    const quickCount=document.querySelector('#yearQuickCount');quickCount.textContent=yearCount;quickCount.classList.add('count-ready');
    document.querySelector('#yearQuickLabel').textContent=`workout days in ${year}`;
    for(const [selector,value] of [['#weekCount',countSince(6)],['#monthCount',countSince(29)],['#yearCount',days.size]]){const count=document.querySelector(selector);count.textContent=value;count.classList.add('count-ready')}
    calendar.replaceChildren();let order=0;for(let offset=11;offset>=0;offset--){const date=new Date(Date.UTC(year,month-offset,1));calendar.append(renderMonth(date.getUTCFullYear(),date.getUTCMonth(),days,data.today,order++))}
    document.querySelector('#updated').textContent=`Showing completed workout dates through ${new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeZone:'UTC'}).format(today)}.`;
    if(days.size===0)document.querySelector('#updated').textContent='No completed workout days have been recorded in the past year yet.';
  }catch(error){calendar.replaceChildren(element('p',error.message,'state error'))}
}
load();
