import webPush from 'web-push';

const validTime=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'');
const appleEndpoint=value=>{
  try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='web.push.apple.com'&&!url.username&&!url.password&&value.length<=2048}catch{return false}
};
const validKey=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{16,256}$/.test(value);

export function createPushReminders({db,env,dayFor,send,json,sendPush=webPush.sendNotification}){
  const publicKey=env.VAPID_PUBLIC_KEY||'',privateKey=env.VAPID_PRIVATE_KEY||'';
  const configured=!!(publicKey&&privateKey);
  const lastTest=new Map();
  if(configured)webPush.setVapidDetails(env.VAPID_SUBJECT||'https://fit.adeticket.com/',publicKey,privateKey);

  async function handle(req,res,{uid,u,method}){
    if(u.pathname==='/api/push/config'&&method==='GET'){
      const profile=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data);
      return send(res,200,{available:configured,publicKey:configured?publicKey:null,enabled:!!profile.reminderPush,subscriptions:db.prepare('SELECT COUNT(*) AS count FROM push_subscriptions WHERE user_id=?').get(uid).count});
    }
    if(u.pathname==='/api/push/subscription'&&method==='POST'){
      if(!configured)return send(res,503,{error:'Push reminders are not configured yet.'});
      const body=await json(req,16*1024),subscription=body.subscription;
      if(!subscription||!appleEndpoint(subscription.endpoint)||!validKey(subscription.keys?.p256dh)||!validKey(subscription.keys?.auth))return send(res,400,{error:'This iPhone push subscription is invalid.'});
      db.prepare('INSERT INTO push_subscriptions(user_id,endpoint,subscription_json,created_at) VALUES(?,?,?,?) ON CONFLICT(user_id,endpoint) DO UPDATE SET subscription_json=excluded.subscription_json').run(uid,subscription.endpoint,JSON.stringify(subscription),new Date().toISOString());
      const row=db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid),profile=JSON.parse(row.data);
      db.prepare('UPDATE profiles SET data=? WHERE user_id=?').run(JSON.stringify({...profile,reminderPush:true}),uid);
      return send(res,200,{ok:true});
    }
    if(u.pathname==='/api/push/subscription'&&method==='DELETE'){
      const body=await json(req,4096);
      if(typeof body.endpoint!=='string'||body.endpoint.length>2048)return send(res,400,{error:'Choose a valid subscription.'});
      db.prepare('DELETE FROM push_subscriptions WHERE user_id=? AND endpoint=?').run(uid,body.endpoint);
      const row=db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid),profile=JSON.parse(row.data);
      if(!db.prepare('SELECT 1 FROM push_subscriptions WHERE user_id=? LIMIT 1').get(uid))db.prepare('UPDATE profiles SET data=? WHERE user_id=?').run(JSON.stringify({...profile,reminderPush:false}),uid);
      return send(res,200,{ok:true});
    }
    if(u.pathname==='/api/push/test'&&method==='POST'){
      if(!configured)return send(res,503,{error:'Push reminders are not configured yet.'});
      const body=await json(req,4096),endpoint=body.endpoint;
      if(typeof endpoint!=='string'||endpoint.length>2048)return send(res,400,{error:'Choose an enabled iPhone subscription.'});
      const row=db.prepare('SELECT subscription_json FROM push_subscriptions WHERE user_id=? AND endpoint=?').get(uid,endpoint);
      if(!row)return send(res,404,{error:'Enable notifications on this iPhone first.'});
      const key=`${uid}:${endpoint}`,last=lastTest.get(key)||0;
      if(Date.now()-last<60_000)return send(res,429,{error:'Wait a minute before sending another test.'});
      lastTest.set(key,Date.now());
      try{await sendPush(JSON.parse(row.subscription_json),JSON.stringify({body:'This is a Steady test reminder.'}),{TTL:60});return send(res,200,{ok:true})}
      catch(error){if(error.statusCode===404||error.statusCode===410)db.prepare('DELETE FROM push_subscriptions WHERE user_id=? AND endpoint=?').run(uid,endpoint);return send(res,502,{error:'The iPhone push service did not accept the test. Disable and re-enable notifications, then try again.'})}
    }
    return send(res,405,{error:'Method not allowed'});
  }

  let sending=false;
  async function sendDue(now=new Date()){
    if(!configured||sending)return;
    sending=true;
    try{
    for(const row of db.prepare('SELECT user_id,data FROM profiles').all()){
      const profile=JSON.parse(row.data);
      if(!profile.reminderPush||!validTime(profile.reminderTime))continue;
      let day,time;
      try{
        day=dayFor(profile.timezone);
        const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:profile.timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(part=>[part.type,part.value]));
        time=Number(parts.hour)*60+Number(parts.minute);
      }catch{continue}
      const target=Number(profile.reminderTime.slice(0,2))*60+Number(profile.reminderTime.slice(3));
      if(time<target||time>=target+10||db.prepare('SELECT 1 FROM checkins WHERE user_id=? AND day=?').get(row.user_id,day))continue;
      for(const subscription of db.prepare('SELECT endpoint,subscription_json FROM push_subscriptions WHERE user_id=? AND (last_sent_day IS NULL OR last_sent_day<>?)').all(row.user_id,day)){
        try{
          await sendPush(JSON.parse(subscription.subscription_json),JSON.stringify({body:'A gentle reminder to check in when it suits you.'}),{TTL:1800});
          db.prepare('UPDATE push_subscriptions SET last_sent_day=? WHERE user_id=? AND endpoint=?').run(day,row.user_id,subscription.endpoint);
        }catch(error){
          if(error.statusCode===404||error.statusCode===410)db.prepare('DELETE FROM push_subscriptions WHERE user_id=? AND endpoint=?').run(row.user_id,subscription.endpoint);
        }
      }
    }
    }finally{sending=false}
  }
  return {handle,sendDue,configured};
}
