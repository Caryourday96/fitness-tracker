import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import webPush from 'web-push';
import { createPushReminders } from './push-reminders.js';

test('push scheduler sends one generic reminder per day and skips completed check-ins',async()=>{
  const db=new DatabaseSync(':memory:');
  db.exec('CREATE TABLE profiles(user_id INTEGER PRIMARY KEY,data TEXT);CREATE TABLE checkins(user_id INTEGER,day TEXT);CREATE TABLE push_subscriptions(user_id INTEGER,endpoint TEXT,subscription_json TEXT,last_sent_day TEXT,created_at TEXT,PRIMARY KEY(user_id,endpoint))');
  db.prepare('INSERT INTO profiles VALUES(?,?)').run(1,JSON.stringify({timezone:'America/Toronto',reminderTime:'18:00',reminderPush:true}));
  const subscription={endpoint:'https://web.push.apple.com/test',keys:{p256dh:'a'.repeat(87),auth:'b'.repeat(22)}};
  db.prepare('INSERT INTO push_subscriptions VALUES(?,?,?,?,?)').run(1,subscription.endpoint,JSON.stringify(subscription),null,'2026-09-24');
  const keys=webPush.generateVAPIDKeys(),sent=[];
  const push=createPushReminders({db,env:{VAPID_PUBLIC_KEY:keys.publicKey,VAPID_PRIVATE_KEY:keys.privateKey},dayFor:()=> '2026-09-24',send:()=>{},json:async()=>({}),sendPush:async(_subscription,payload)=>sent.push(JSON.parse(payload))});
  await push.sendDue(new Date('2026-09-24T21:59:00Z'));assert.equal(sent.length,0);
  await push.sendDue(new Date('2026-09-24T22:05:00Z'));assert.equal(sent.length,1);assert.deepEqual(sent[0],{body:'A gentle reminder to check in when it suits you.'});
  await push.sendDue(new Date('2026-09-24T22:06:00Z'));assert.equal(sent.length,1);
  db.prepare('UPDATE push_subscriptions SET last_sent_day=NULL').run();db.prepare('INSERT INTO checkins VALUES(?,?)').run(1,'2026-09-24');
  await push.sendDue(new Date('2026-09-24T22:07:00Z'));assert.equal(sent.length,1);
  let rejected;
  const guarded=createPushReminders({db,env:{VAPID_PUBLIC_KEY:keys.publicKey,VAPID_PRIVATE_KEY:keys.privateKey},dayFor:()=> '2026-09-24',send:(_res,status,body)=>{rejected={status,body}},json:async()=>({subscription:{endpoint:'https://127.0.0.1/private',keys:subscription.keys}}),sendPush:async()=>{}});
  await guarded.handle({},null,{uid:1,u:{pathname:'/api/push/subscription'},method:'POST'});
  assert.equal(rejected.status,400);
  db.close();
});

test('test push is limited to the owner subscription and one request per minute',async()=>{
  const db=new DatabaseSync(':memory:');
  db.exec('CREATE TABLE push_subscriptions(user_id INTEGER,endpoint TEXT,subscription_json TEXT,last_sent_day TEXT,created_at TEXT,PRIMARY KEY(user_id,endpoint))');
  const subscription={endpoint:'https://web.push.apple.com/owner',keys:{p256dh:'a'.repeat(87),auth:'b'.repeat(22)}};
  db.prepare('INSERT INTO push_subscriptions VALUES(?,?,?,?,?)').run(1,subscription.endpoint,JSON.stringify(subscription),null,'2026-09-24');
  const keys=webPush.generateVAPIDKeys(),sent=[];let result;
  const push=createPushReminders({db,env:{VAPID_PUBLIC_KEY:keys.publicKey,VAPID_PRIVATE_KEY:keys.privateKey},dayFor:()=> '2026-09-24',send:(_res,status,body)=>{result={status,body}},json:async()=>({endpoint:subscription.endpoint}),sendPush:async(_sub,payload)=>sent.push(JSON.parse(payload))});
  const request={uid:2,u:{pathname:'/api/push/test'},method:'POST'};
  await push.handle({},null,request);assert.equal(result.status,404);assert.equal(sent.length,0);
  request.uid=1;
  await push.handle({},null,request);assert.equal(result.status,200);assert.deepEqual(sent,[{body:'This is a Steady test reminder.'}]);
  await push.handle({},null,request);assert.equal(result.status,429);assert.equal(sent.length,1);
  db.close();
});
