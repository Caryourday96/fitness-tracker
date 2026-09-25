export function reminderDue(profile,check,day,now=new Date()){
  if(!profile?.reminderInApp||check||!/^([01]\d|2[0-3]):[0-5]\d$/.test(profile.reminderTime||''))return false;
  try{
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:profile.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(part=>[part.type,part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`===day&&`${parts.hour}:${parts.minute}`>=profile.reminderTime;
  }catch{return false}
}
