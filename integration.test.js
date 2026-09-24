import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { googleIdentity } from './security.js';
test('Google header requires Azure hosting and Google identity',()=>{
 const headers={'x-ms-client-principal':Buffer.from(JSON.stringify({auth_typ:'google',claims:[{typ:'sub',val:'test-subject'},{typ:'email',val:'test@example.com'}]})).toString('base64')};
 assert.equal(googleIdentity(headers,{NODE_ENV:'production'}),null);
 assert.deepEqual(googleIdentity(headers,{NODE_ENV:'production',WEBSITE_SITE_NAME:'test'}),{subject:'test-subject',email:'test@example.com'});
});
test('private session, workout conflicts and reconnect recovery',async()=>{
 process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'steady-test-'));
 const {server}=await import('./server.js');
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let base='http://127.0.0.1:'+server.address().port,cookie='';
 async function request(route,body,method='POST',extra={}){return fetch(base+route,{method,headers:{Origin:base,'X-Requested-With':'Steady','Content-Type':'application/json',Cookie:cookie,...extra},body:body===undefined?undefined:JSON.stringify(body)})}
 try {
 assert.equal((await request('/api/me',undefined,'GET')).status,401);

 const setup=await request('/api/setup',{email:'test@example.com',password:'long test password here'});assert.equal(setup.status,200);cookie=setup.headers.get('set-cookie').split(';')[0];
 assert.equal((await request('/api/profile',{timezone:'UTC',onboardingComplete:true} ,'PUT')).status,200);
 assert.equal((await request('/api/checkin',{symptoms:'none',energy:'medium'})).status,200);
 assert.equal((await request('/api/plan/confirm',{})).status,200);
 const data={exercises:[{name:'Treadmill',sets:[{duration:12,distance:0.8,incline:1}]}]};
 const saved=await request('/api/workout',{data,status:'active'});assert.equal(saved.status,200);
 assert.equal((await request('/api/workout',{data,status:'active'})).status,409);
 assert.equal((await request('/api/plan/confirm',{})).status,409);
 await new Promise(resolve=>server.close(resolve));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
 const me=await (await request('/api/me',undefined,'GET')).json();assert.equal(me.workout.exercises[0].sets[0].duration,12);
 const review={day:'2026-09-23',workout:'planned rest',food:'partly',steps:'',notes:'test'};
 assert.equal((await request('/api/day-review',review,'PUT')).status,200);
 assert.equal((await request('/api/day-review',review,'PUT')).status,409);
 const progress=await (await request('/api/progress',undefined,'GET')).json();assert.equal(progress.reviews[0].steps,null);
 assert.equal((await request('/api/logout',{})).status,200);
 assert.equal((await request('/api/me',undefined,'GET')).status,401);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
