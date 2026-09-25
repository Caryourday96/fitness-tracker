import http from 'node:http';
import { activityTrend, validDay, weightTrend } from './progress.js';
import { allowedWrite, googleIdentity, validWorkout } from './security.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { handleOwnerShare, handlePublicPartner, initializePartnerSharing, seedStarterFoods } from './partner-sharing.js';
import { handlePublicWorkoutDays } from './workout-days.js';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { ManagedIdentityCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { createPrivateBackup, verifyLatestPrivateBackup } from './backups.js';
import { suggestMeals, validMealSettings } from './meal-guidance.js';
import { summarizeWorkout } from './public/workout-recap.js';
import { weeklyReview, weekBounds } from './weekly-review.js';
import { createPushReminders } from './push-reminders.js';
import { alternateWorkoutPlan, trainingTemplate, trainingContext, validSchedule, withCatalogOptions } from './training.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3030);
const DATA = process.env.DATA_DIR || path.join(ROOT, 'data'); fs.mkdirSync(DATA, { recursive: true });
const UPLOADS = path.join(DATA, 'uploads'); fs.mkdirSync(UPLOADS, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(path.join(DATA, 'fitness.sqlite'));
const backupStorageUrl = process.env.BACKUP_STORAGE_URL;
const backupContainerName = process.env.BACKUP_CONTAINER;
const backupContainer = backupStorageUrl && backupContainerName
  ? new BlobServiceClient(backupStorageUrl, new ManagedIdentityCredential()).getContainerClient(backupContainerName)
  : null;
const backupState = { enabled: !!backupContainer, running: false, lastBackup: null, lastVerification: null, lastError: null };
const attempts = new Map();
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL, google_revoked INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS profiles(user_id INTEGER PRIMARY KEY REFERENCES users(id), data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS checkins(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, day TEXT NOT NULL, data TEXT NOT NULL, UNIQUE(user_id, day));
CREATE TABLE IF NOT EXISTS plans(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, day TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, UNIQUE(user_id, day));
CREATE TABLE IF NOT EXISTS workouts(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, day TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(user_id, day));
CREATE TABLE IF NOT EXISTS measurements(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, kind TEXT NOT NULL, value REAL NOT NULL, unit TEXT NOT NULL, measured_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS foods(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, preference TEXT NOT NULL, notes TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS push_subscriptions(user_id INTEGER NOT NULL, endpoint TEXT NOT NULL, subscription_json TEXT NOT NULL, last_sent_day TEXT, created_at TEXT NOT NULL, PRIMARY KEY(user_id,endpoint));`);
try{db.exec('ALTER TABLE users ADD COLUMN google_revoked INTEGER NOT NULL DEFAULT 0')}catch{}
try{db.exec('ALTER TABLE foods ADD COLUMN available INTEGER NOT NULL DEFAULT 1')}catch{}
db.exec(`CREATE TABLE IF NOT EXISTS food_logs(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, day TEXT NOT NULL, meal TEXT NOT NULL, item TEXT NOT NULL, portion TEXT DEFAULT '', notes TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sleep_logs(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, day TEXT NOT NULL, hours REAL, quality TEXT, notes TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activity_logs(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, day TEXT NOT NULL, kind TEXT NOT NULL, duration INTEGER, distance REAL, steps INTEGER, notes TEXT DEFAULT '', created_at TEXT NOT NULL);`);
db.exec(`CREATE TABLE IF NOT EXISTS uploads(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, day TEXT NOT NULL, filename TEXT NOT NULL, mime TEXT NOT NULL, bytes INTEGER NOT NULL, caption TEXT DEFAULT '', kind TEXT NOT NULL DEFAULT 'screenshot', created_at TEXT NOT NULL);`);
if(!db.prepare('PRAGMA table_info(uploads)').all().some(column=>column.name==='kind'))db.exec("ALTER TABLE uploads ADD COLUMN kind TEXT NOT NULL DEFAULT 'screenshot'");

db.exec('CREATE TABLE IF NOT EXISTS day_reviews(user_id INTEGER NOT NULL, day TEXT NOT NULL, data TEXT NOT NULL, version TEXT NOT NULL, PRIMARY KEY(user_id,day))');
db.exec('CREATE TABLE IF NOT EXISTS exercise_profiles(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, exercise_name TEXT NOT NULL, equipment_name TEXT NOT NULL, load_meaning TEXT NOT NULL, setup_note TEXT NOT NULL DEFAULT \'\', UNIQUE(user_id,exercise_name,equipment_name))');
db.exec('CREATE TABLE IF NOT EXISTS meal_favourites(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL, meal TEXT NOT NULL, food_ids TEXT NOT NULL, portion TEXT NOT NULL DEFAULT \'\')');
initializePartnerSharing(db);
const now = () => new Date().toISOString();
const favouriteDetails=(uid,b)=>{const name=String(b.name||'').trim(),portion=String(b.portion||'').trim(),ids=b.foodIds;if(!name||name.length>120||portion.length>240||!['breakfast','lunch','dinner','snack'].includes(b.meal)||!Array.isArray(ids)||ids.length<1||ids.length>10||!ids.every(id=>Number.isSafeInteger(id)&&id>0)||new Set(ids).size!==ids.length)return null;const usable=db.prepare("SELECT 1 FROM foods WHERE id=? AND user_id=? AND available=1 AND preference='preferred'");if(!ids.every(id=>usable.get(id,uid)))return null;return {name,meal:b.meal,foodIds:ids,portion}};
const dayFor = (tz = 'UTC') => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
const hash = (v) => crypto.createHash('sha256').update(v).digest('hex');
const send = (res, status, body, type='application/json') => { res.writeHead(status, {'Content-Type': type, 'Cache-Control':'no-store'}); res.end(type==='application/json' ? JSON.stringify(body) : body); };
const json = async (req, limit=8*1024*1024) => { let s='',size=0; for await (const c of req) { size+=c.length; if(size>limit) { const e=new Error('Request is too large'); e.status=413; throw e; } s+=c; } try{return s ? JSON.parse(s) : {}}catch{const e=new Error('Invalid JSON request');e.status=400;throw e} };
const pushReminders=createPushReminders({db,env:process.env,dayFor,send,json});
const parseCookies = (s='') => Object.fromEntries(s.split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]}));
const sessionUser = (req) => { const token=parseCookies(req.headers.cookie).session; if(!token) return null; const row=db.prepare('SELECT user_id,expires_at FROM sessions WHERE token_hash=?').get(hash(token)); if(!row || row.expires_at<Date.now()) return null; return row.user_id; };
const passwordHash = (p) => { const salt=crypto.randomBytes(16).toString('hex'); return `${salt}:${crypto.scryptSync(p,salt,64).toString('hex')}`; };
const passwordOk = (p, stored) => { const [salt,key]=stored.split(':'); if(!salt||!key) return false; return crypto.timingSafeEqual(Buffer.from(key,'hex'),crypto.scryptSync(p,salt,64)); };
const establishSession = (res,id) => { const t=crypto.randomBytes(32).toString('base64url'); db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(hash(t),id,Date.now()+1000*60*60*24*30); res.setHeader('Set-Cookie',`session=${encodeURIComponent(t)}; Max-Age=2592000; HttpOnly; SameSite=Lax; Path=/${process.env.NODE_ENV==='production'?'; Secure':''}`); };
function easyAuthPrincipal(req) {
  return googleIdentity(req.headers)?.email||null;
}
function bridgeEasyAuth(req,res,allowGoogleLogin=false) {
  const email=easyAuthPrincipal(req); if(!email) return null;
  let row=db.prepare('SELECT id,google_revoked FROM users WHERE email=?').get(email);
  if(row&&sessionUser(req)===row.id)return{id:row.id};
  if(!allowGoogleLogin)return null;
  if(!row) {
    if(db.prepare('SELECT 1 FROM users LIMIT 1').get()) return {error:'This private tracker account is already assigned to another email.'};
    const info=db.prepare('INSERT INTO users(email,password_hash,created_at) VALUES(?,?,?)').run(email,passwordHash(crypto.randomBytes(32).toString('hex')),now());
    db.prepare('INSERT INTO profiles(user_id,data) VALUES(?,?)').run(info.lastInsertRowid,JSON.stringify(profileDefaults)); row={id:info.lastInsertRowid};
  }
  if(row.google_revoked)db.prepare('UPDATE users SET google_revoked=0 WHERE id=?').run(row.id);
  establishSession(res,row.id); return {id:row.id};
}
const profileDefaults = {timezone:'UTC', units:'lb', schedule:3, preferredDays:[], duration:60, experience:'beginner', equipment:'', injuries:'', restrictions:'', onboardingComplete:false, reminderInApp:false, reminderTime:'18:00'};
function cardioProgression(context, minutes, readinessLimited) {
  const cap=minutes>=75?30:minutes>=60?25:minutes>=40?15:0;
  if(!cap)return{targetMinutes:0,reason:'No separate cardio block fits the selected session duration.'};
  const start=minutes>=60?15:10,sessions=context.cardioSessions||[],last=sessions[0];
  let target=Math.min(cap,Math.max(start,Number(last?.targetMinutes)||start)),reason=last?(Number(last.targetMinutes)>cap?'Reduced the suggestion to fit today’s available time.':'Held near your recent logged target; increase only after two target-complete sessions.'):'Starting with a short, comfortable duration; no cardio history is available yet.';
  const twoTargetsMet=sessions.length>=2&&sessions.slice(0,2).every(s=>Number(s.targetMinutes)>0&&Number(s.actualMinutes)>=Number(s.targetMinutes));
  if(twoTargetsMet&&last) {const proposed=Number(last.targetMinutes)+5;if(proposed<=cap){target=proposed;reason='You met the planned duration in your last two logged treadmill sessions; this suggests a small five-minute increase. Keep the pace comfortable.'}else{target=cap;reason=Number(last.targetMinutes)>=cap?'You met recent targets; the gradual duration cap for this session time has been reached.':'The next five-minute step would exceed the available-time cap, so hold this suggestion steady.'}}
  if(readinessLimited) {target=Math.min(target,10);reason='Readiness is lower today, so keep cardio short and easy; progression is paused.'}
  return{targetMinutes:target,reason};
}
function planFor(check, profile, day, context={}) {
  const c=check||{}; const urgent=(Number(c.systolic)>=180||Number(c.diastolic)>=120) || ['chest-pain','fainting','severe-breathlessness'].includes(c.symptoms);
  if(urgent) return {kind:'safety-stop', title:'Pause exercise and get medical guidance', reason:'Your check-in includes a reading or symptom that should be assessed before exercise.', exercises:[], cardio:null, safety:'If chest pain, fainting, severe shortness of breath, or another concerning symptom is present, call 911 now. For a reading at or above 180 systolic or 120 diastolic without symptoms, sit quietly and repeat it after at least 1 minute; if it remains that high, contact a healthcare professional promptly.'};
  if(profile.clearance==='restricted'||profile.injuries||profile.restrictions) return {kind:'safety-stop',title:'Review your movement restrictions',reason:'Follow your clinician-approved routine. This planner cannot interpret free-text restrictions safely.',exercises:[],cardio:null,safety:'Tracking remains available.'};
  if(!context.overrideRecovery&&(check.trainedYesterday==='yes'||(check.trainedYesterday!=='no'&&context.daysSinceLastWorkout===1)))return{kind:'recovery',title:'Recovery day after yesterday’s workout',reason:'You reported or logged a workout yesterday. Give strength training a recovery day; a short easy walk is optional if it feels comfortable.',exercises:[],cardio:check.gym==='no'?'Rest or gentle mobility':'Optional 10–20 minute comfortable walk',safety:'Keep any activity easy and stop if you feel pain, dizziness, unusual breathlessness, or concerning symptoms.'};
  const scheduled=Number(profile.schedule)||3,completed=context.sessionsInLast7||0;
  if(!context.overrideRecovery&&completed>=scheduled)return{kind:'recovery',title:'Planned recovery day',reason:`You have logged ${completed} sessions in the past seven days, meeting your ${scheduled}-session preference. Take a recovery day; do not make up missed workouts.`,exercises:[],cardio:'Optional comfortable walk or gentle mobility',safety:'Keep activity easy and stop for pain, dizziness, unusual breathlessness, or concerning symptoms.'};
  const preferredDays=Array.isArray(profile.preferredDays)?profile.preferredDays:[];
  const weekday=new Date(`${day}T12:00:00Z`).getUTCDay();
  if(!context.overrideRecovery&&preferredDays.length&&!preferredDays.includes(weekday))return{kind:'recovery',title:'Your planned rest day',reason:'Today is outside your preferred training weekdays. Your training sequence will continue on your next chosen day; missed days do not add catch-up volume.',exercises:[],cardio:'Optional easy walking if comfortable',safety:'Recovery counts toward consistency. Stop activity if symptoms or pain occur.'};
  const low=c.energy==='low'||c.soreness==='high'||c.pain==='movement-pain',reentry=!context.overrideRecovery&&context.daysSinceLastWorkout>=7,fourthLight=!context.overrideRecovery&&scheduled===4&&completed>=3; const mins=Number(c.minutes||profile.duration||60); const base=low||reentry||fourthLight?2:3;
  const templateProfile={...profile,equipment:c.gym==='no'?'home / walking':profile.equipment};
  const selected=trainingTemplate(templateProfile,context,base),exercises=selected.exercises;
  const cardio=reentry||fourthLight?{targetMinutes:0,reason:'Cardio progression is paused for this lighter session.'}:cardioProgression(context,mins,low);
  if(mins>=40&&cardio.targetMinutes>0) exercises.push({name:'Treadmill walk',pattern:'cardio',muscles:'cardiorespiratory',sets:1,reps:`${cardio.targetMinutes} min`,targetMinutes:cardio.targetMinutes,progressionReason:cardio.reason,rest:'as needed',settings:{speed:'comfortable speaking pace',incline:'0%',effort:'easy to moderate; able to speak comfortably'},cue:'Start easy for 5 minutes. Enter the actual duration you complete; reduce speed or stop if symptoms, unusual breathlessness, dizziness, or pain occur.',alternatives:'Easy bike or outdoor walk.'});
  const selectedExercises=mins<=40?[...exercises.filter(x=>x.pattern!=='cardio').slice(0,2),...exercises.filter(x=>x.pattern==='cardio')]:exercises;
  return {template:selected.template,catalogAttribution:selectedExercises.some(exercise=>exercise.substitutions?.some(option=>option.source==='ExerciseAPI'))?selected.catalogAttribution:null,kind:low?'recovery-strength':reentry?'reentry':fourthLight?'fourth-light':'strength', title:low?'Steady recovery session':reentry?'Gentle return session':fourthLight?'Light fourth session':`${selected.title} · strength for sustainable weight loss`, reason:low?'Reduced volume because your check-in shows lower readiness.':reentry?'Reduced the session to two sets per movement after a longer gap; do not make up missed workouts.':fourthLight?'Reduced the fourth session to two sets per movement after three sessions in the last seven days.':`Next in your ${scheduled}-session sequence: ${selected.title}. Repeatable resistance work supports maintaining muscle during weight loss; missed days do not add catch-up volume.`, exercises:selectedExercises, cardio:cardio.targetMinutes?`${cardio.targetMinutes} min easy-to-moderate walk`:'No separate cardio block planned for this short session', cardioProgression:cardio, safety:'Warm up 5 minutes, breathe continuously, stop for chest pain, fainting, severe dizziness, unusual shortness of breath, or movement-related pain.'};
}
async function route(req,res) {
  const u=new URL(req.url,`http://${req.headers.host}`), method=req.method;
  if(['POST','PUT','PATCH','DELETE'].includes(method)) {
    const origin=process.env.NODE_ENV==='production'?(process.env.APP_ORIGIN||'https://fit.adeticket.com'):`${req.headers['x-forwarded-proto']==='https'?'https':'http'}://${req.headers.host}`;
    if(!allowedWrite(req,origin)) return send(res,403,{error:'Request origin could not be verified. Refresh the app and try again.'});
  }
  const googleCallback=method==='GET'&&u.pathname==='/api/auth/google';
  const bridged=bridgeEasyAuth(req,res,googleCallback); if(bridged?.error) return send(res,403,{error:bridged.error});
  if(googleCallback){if(!bridged?.id){res.writeHead(302,{Location:'/', 'Cache-Control':'no-store'});return res.end()}res.writeHead(302,{Location:'/', 'Cache-Control':'no-store'});return res.end()}
  if(handlePublicWorkoutDays(req,res,{db,send,root:ROOT}))return;
  if(method==='GET' && (u.pathname==='/'||u.pathname==='/index.html')) return send(res,200,fs.readFileSync(path.join(ROOT,'public','index.html'),'utf8'),'text/html; charset=utf-8');
  if(method==='GET' && u.pathname==='/sw.js')return send(res,200,fs.readFileSync(path.join(ROOT,'public','sw.js')),'application/javascript; charset=utf-8');
  if(method==='GET' && u.pathname==='/offline.html')return send(res,200,fs.readFileSync(path.join(ROOT,'public','offline.html')),'text/html; charset=utf-8');
  if(method==='GET' && u.pathname==='/static/sw.js')return send(res,404,{error:'Not found'});
  if(method==='GET' && u.pathname.startsWith('/static/')) { const name=u.pathname.slice(8); if(!/^[a-z0-9][a-z0-9._-]*$/i.test(name))return send(res,404,{error:'Not found'});const f=path.join(ROOT,'public',name),types={'.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json; charset=utf-8'};if(fs.existsSync(f)&&fs.statSync(f).isFile())return send(res,200,fs.readFileSync(f),types[path.extname(f)]||'application/octet-stream'); return send(res,404,{error:'Not found'}); }
  if(method==='GET' && u.pathname==='/api/status') { const user=bridged?.id||sessionUser(req); return send(res,200,{authenticated:!!user, hasUser:!!db.prepare('SELECT 1 FROM users LIMIT 1').get()}); }
  if(method==='POST' && u.pathname==='/api/setup') { const key=`setup:${req.socket.remoteAddress||'unknown'}`; if(!takeAttempt(key,4,60*60*1000))return send(res,429,{error:'Too many setup attempts. Try again later.'}); if(db.prepare('SELECT 1 FROM users LIMIT 1').get()) return send(res,409,{error:'Account already exists'}); const b=await json(req); if(!b.email||!b.password||b.password.length<12) return send(res,400,{error:'Use an email and a password of at least 12 characters'}); if(db.prepare('SELECT 1 FROM users LIMIT 1').get())return send(res,409,{error:'Account already exists'}); const info=db.prepare('INSERT INTO users(email,password_hash,created_at) VALUES(?,?,?)').run(b.email.toLowerCase(),passwordHash(b.password),now()); db.prepare('INSERT INTO profiles(user_id,data) VALUES(?,?)').run(info.lastInsertRowid,JSON.stringify({...profileDefaults,...b.profile})); return login(res,info.lastInsertRowid); }
  if(method==='POST' && u.pathname==='/api/login') { const b=await json(req), email=String(b.email||'').trim().toLowerCase(), key=`login:${email}`; if(!takeAttempt(key,8,15*60*1000))return send(res,429,{error:'Too many sign-in attempts for this email. Wait 15 minutes or continue with Google.'}); const row=db.prepare('SELECT * FROM users WHERE email=?').get(email); if(!row||!passwordOk(b.password||'',row.password_hash)) return send(res,401,{error:'Invalid email or password'}); attempts.delete(key); return login(res,row.id); }
  if(method==='POST' && (u.pathname==='/api/logout'||u.pathname==='/api/logout-all')) { const token=parseCookies(req.headers.cookie).session; const uid=token?db.prepare('SELECT user_id FROM sessions WHERE token_hash=?').get(hash(token))?.user_id:null; if(u.pathname==='/api/logout-all'&&uid){db.prepare('DELETE FROM sessions WHERE user_id=?').run(uid);db.prepare('UPDATE users SET google_revoked=1 WHERE id=?').run(uid)}else if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token));res.setHeader('Set-Cookie',`session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/${process.env.NODE_ENV==='production'?'; Secure':''}`);return send(res,200,{ok:true}); }
  if(await handlePublicPartner(req,res,{db,hash,send,root:ROOT,json}))return;
  const uid=bridged?.id||sessionUser(req); if(!uid) { send(res,401,{error:'Sign in required'}); return; }
  if(u.pathname==='/api/push/config'||u.pathname==='/api/push/subscription'||u.pathname==='/api/push/test')return pushReminders.handle(req,res,{uid,u,method});
  seedStarterFoods(db,uid);
  const shareOrigin=process.env.NODE_ENV==='production'?(process.env.APP_ORIGIN||'https://fit.adeticket.com'):`${req.headers['x-forwarded-proto']==='https'?'https':'http'}://${req.headers.host}`;
  if(handleOwnerShare(req,res,{db,userId:uid,hash,now,send,origin:shareOrigin}))return;
  if(method==='GET' && u.pathname==='/api/backups/status') return send(res,200,{...backupState});
  if(method==='POST' && u.pathname==='/api/backups/run') { if(!takeAttempt(`backup:${uid}`,2,60*60*1000))return send(res,429,{error:'Backup limit reached. Try again later.'}); try { const result=await performBackup(); return send(res,200,{ok:true,...result}); } catch { return send(res,503,{error:'Backup failed. Your current app data was not changed.'}); } }
  if(method==='POST' && u.pathname==='/api/backups/verify') { if(!takeAttempt(`backup-verify:${uid}`,4,60*60*1000))return send(res,429,{error:'Verification limit reached. Try again later.'}); try { const result=await verifyLatestPrivateBackup({container:backupContainer}); backupState.lastVerification=result.createdAt; return send(res,200,{ok:true,...result}); } catch { return send(res,503,{error:'Backup verification failed. Your current app data was not changed.'}); } }
  if(method==='GET' && u.pathname==='/api/weekly-review'){
    const profile=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data),today=dayFor(profile.timezone),week=u.searchParams.get('week')||today;
    if(!validDay(week)||week>today)return send(res,400,{error:'Choose a valid week up to today'});
    const {start,end}=weekBounds(week),workouts=db.prepare('SELECT day,status,data FROM workouts WHERE user_id=? AND day BETWEEN ? AND ? ORDER BY day').all(uid,start,end).map(row=>({...row,data:JSON.parse(row.data)}));
    const reviews=db.prepare('SELECT day,data FROM day_reviews WHERE user_id=? AND day BETWEEN ? AND ? ORDER BY day').all(uid,start,end).map(row=>({...JSON.parse(row.data),day:row.day}));
    const activities=db.prepare('SELECT day,steps FROM activity_logs WHERE user_id=? AND day BETWEEN ? AND ? ORDER BY day').all(uid,start,end);
    const measurements=db.prepare('SELECT kind,value,unit,measured_at FROM measurements WHERE user_id=? AND substr(measured_at,1,10) BETWEEN ? AND ? ORDER BY measured_at').all(uid,start,end);
    return send(res,200,weeklyReview({week,today,workouts,reviews,activities,measurements,profile}));
  }
  if(method==='GET' && u.pathname==='/api/progress') {
    const p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data);
    const reviews=db.prepare('SELECT day,data,version FROM day_reviews WHERE user_id=? ORDER BY day DESC LIMIT 365').all(uid).map(r=>({...JSON.parse(r.data),day:r.day,version:r.version}));
    const measures=db.prepare('SELECT kind,value,unit,measured_at FROM measurements WHERE user_id=? ORDER BY measured_at').all(uid);const reviewMeasures=reviews.flatMap(r=>[...(r.weight==null?[]:[{kind:'weight',value:r.weight,unit:r.weightUnit,measured_at:r.day}]),...(r.waist==null?[]:[{kind:'waist',value:r.waist,unit:r.waistUnit,measured_at:r.day}])]);const allMeasures=[...measures,...reviewMeasures];
    const end=dayFor(p.timezone),activityRows=db.prepare('SELECT day,duration,distance,steps,kind,notes FROM activity_logs WHERE user_id=? AND day>=? ORDER BY day DESC,id DESC LIMIT 500').all(uid,new Date(Date.parse(end+'T12:00:00Z')-365*86400000).toISOString().slice(0,10));
    const workoutRows=db.prepare('SELECT day,data FROM workouts WHERE user_id=? AND day>=? AND day<=? ORDER BY day DESC LIMIT 365').all(uid,new Date(Date.parse(end+'T12:00:00Z')-365*86400000).toISOString().slice(0,10),end).map(w=>({...w,data:JSON.parse(w.data)}));
    const foodRows=db.prepare('SELECT day,meal,item,portion,notes FROM food_logs WHERE user_id=? AND day>=? ORDER BY day DESC,id DESC LIMIT 500').all(uid,new Date(Date.parse(end+'T12:00:00Z')-365*86400000).toISOString().slice(0,10));
    const sleepRows=db.prepare('SELECT day,hours,quality,notes FROM sleep_logs WHERE user_id=? AND day>=? ORDER BY day DESC,id DESC LIMIT 365').all(uid,new Date(Date.parse(end+'T12:00:00Z')-365*86400000).toISOString().slice(0,10));
    const summary=activityTrend({reviews,activities:activityRows,workouts:workoutRows},end);
    return send(res,200,{measures:allMeasures,reviews,activities:activityRows,workouts:workoutRows,foodLogs:foodRows,sleepLogs:sleepRows,activitySummary:summary,trend:weightTrend(allMeasures,end)});
  }
  if(method==='PUT' && u.pathname==='/api/day-review') {
    const b=await json(req),p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data);if(!validDay(b.day)||b.day>dayFor(p.timezone))return send(res,400,{error:'Choose a valid date up to today'});
    if(!['completed','partial','not completed','planned rest'].includes(b.workout)||!['on track','partly','off track'].includes(b.food))return send(res,400,{error:'Choose the daily status options'});
    if(b.steps!=='' && (!Number.isInteger(Number(b.steps))||Number(b.steps)<0||Number(b.steps)>150000))return send(res,400,{error:'Check your step count'});
    const cardio=b.cardio||'not planned',energy=b.energy||'medium',soreness=b.soreness||'none';if(!['completed','partial','not completed','not planned'].includes(cardio)||!['high','medium','low'].includes(energy)||!['none','mild','high'].includes(soreness))return send(res,400,{error:'Choose the daily cardio, energy and soreness options'});
    const optional=(value,max)=>value===''||value==null?null:Number.isFinite(Number(value))&&Number(value)>=0&&Number(value)<=max?Number(value):NaN;
    const weight=optional(b.weight,2000),waist=optional(b.waist,300),systolic=optional(b.systolic,350),diastolic=optional(b.diastolic,250);if([weight,waist,systolic,diastolic].some(Number.isNaN))return send(res,400,{error:'Check the optional measurement values'});
    if((systolic===null)!==(diastolic===null))return send(res,400,{error:'Enter both blood-pressure numbers or leave both blank'});
    if(weight!==null&&!['lb','kg'].includes(b.weightUnit)||waist!==null&&!['in','cm'].includes(b.waistUnit))return send(res,400,{error:'Choose the units for optional measurements'});
    const old=db.prepare('SELECT version FROM day_reviews WHERE user_id=? AND day=?').get(uid,b.day);
    if(old && old.version!==b.version)return send(res,409,{error:'This day changed in another tab. Reload its saved review first.'});
    const version=crypto.randomUUID();const data={workout:b.workout,cardio,food:b.food,steps:b.steps===''||b.steps==null?null:Number(b.steps),energy,soreness,weight,weightUnit:weight===null?null:b.weightUnit,waist,waistUnit:waist===null?null:b.waistUnit,systolic,diastolic,notes:String(b.notes||'').slice(0,2000)};
    db.prepare('INSERT INTO day_reviews(user_id,day,data,version) VALUES(?,?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET data=excluded.data,version=excluded.version').run(uid,b.day,JSON.stringify(data),version);
    return send(res,200,{ok:true,version});
  }
  if(method==='GET' && u.pathname==='/api/me') { const p=db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid); const tz=(p?JSON.parse(p.data):profileDefaults).timezone||'UTC', day=dayFor(tz); const check=db.prepare('SELECT data FROM checkins WHERE user_id=? AND day=?').get(uid,day); const plan=db.prepare('SELECT data,status FROM plans WHERE user_id=? AND day=?').get(uid,day); const workout=db.prepare('SELECT data,status,updated_at FROM workouts WHERE user_id=? AND day=?').get(uid,day); const measures=db.prepare('SELECT kind,value,unit,measured_at FROM measurements WHERE user_id=? ORDER BY measured_at DESC LIMIT 60').all(uid); const foods=db.prepare('SELECT * FROM foods WHERE user_id=? ORDER BY name').all(uid); const foodLogs=db.prepare('SELECT * FROM food_logs WHERE user_id=? AND day=? ORDER BY id DESC').all(uid,day); const sleep=db.prepare('SELECT * FROM sleep_logs WHERE user_id=? AND day=? ORDER BY id DESC LIMIT 1').get(uid,day); const activities=db.prepare('SELECT * FROM activity_logs WHERE user_id=? AND day=? ORDER BY id DESC').all(uid,day); const mealFavourites=db.prepare('SELECT id,name,meal,food_ids AS foodIds,portion FROM meal_favourites WHERE user_id=? ORDER BY name').all(uid).map(f=>({...f,foodIds:JSON.parse(f.foodIds)})); const exerciseProfiles=db.prepare('SELECT id,exercise_name AS exerciseName,equipment_name AS equipmentName,load_meaning AS loadMeaning,setup_note AS setupNote FROM exercise_profiles WHERE user_id=? ORDER BY exercise_name,equipment_name').all(uid); const workoutHistory=db.prepare('SELECT day,data,status,updated_at FROM workouts WHERE user_id=? ORDER BY day DESC LIMIT 60').all(uid).map(w=>({...w,data:JSON.parse(w.data)})); return send(res,200,{profile:p?JSON.parse(p.data):profileDefaults,day,check:check?JSON.parse(check.data):null,plan:plan?{...withCatalogOptions(JSON.parse(plan.data),p?JSON.parse(p.data):profileDefaults,check?JSON.parse(check.data):{}),status:plan.status}:null,workout:workout?{...JSON.parse(workout.data),status:workout.status,version:workout.updated_at}:null,measures,foods,foodLogs,sleep,activities,workoutHistory,exerciseProfiles,mealFavourites,mealGuidance:suggestMeals(p?JSON.parse(p.data):profileDefaults,foods)}); }
  if(method==='PUT' && u.pathname==='/api/profile') { const b=await json(req); try{dayFor(b.timezone)}catch{return send(res,400,{error:'Choose a valid time zone'})}; if(!validSchedule(b))return send(res,400,{error:'Choose either no preferred weekdays or exactly the number of days in your weekly schedule.'}); if(!validMealSettings(b))return send(res,400,{error:'Check your meal times and food preferences.'}); if(b.reminderInApp!=null&&typeof b.reminderInApp!=='boolean'||b.reminderTime!=null&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.reminderTime))return send(res,400,{error:'Choose a valid reminder time.'}); db.prepare('UPDATE profiles SET data=? WHERE user_id=?').run(JSON.stringify({...profileDefaults,...b,preferredDays:b.preferredDays??[]}),uid); return send(res,200,{ok:true}); }
  if(method==='POST' && u.pathname==='/api/exercise-profiles') {
    const b=await json(req),exerciseName=String(b.exerciseName||'').trim(),equipmentName=String(b.equipmentName||'').trim(),setupNote=String(b.setupNote||'').trim();
    if(!exerciseName||exerciseName.length>120||!equipmentName||equipmentName.length>120||setupNote.length>1000||!['total','per hand','per side','assisted'].includes(b.loadMeaning))return send(res,400,{error:'Check exercise, equipment, load label and setup note'});
    try{const result=db.prepare('INSERT INTO exercise_profiles(user_id,exercise_name,equipment_name,load_meaning,setup_note) VALUES(?,?,?,?,?)').run(uid,exerciseName,equipmentName,b.loadMeaning,setupNote);return send(res,201,{id:Number(result.lastInsertRowid)})}
    catch{return send(res,409,{error:'This exercise and equipment profile already exists. Edit its setup note instead.'})}
  }
  if(method==='PUT' && /^\/api\/exercise-profiles\/\d+$/.test(u.pathname)) {
    const id=Number(u.pathname.split('/').pop()),b=await json(req),setupNote=String(b.setupNote||'').trim();
    if(setupNote.length>1000)return send(res,400,{error:'Setup note is too long'});
    const result=db.prepare('UPDATE exercise_profiles SET setup_note=? WHERE id=? AND user_id=?').run(setupNote,id,uid);
    return send(res,result.changes?200:404,result.changes?{ok:true}:{error:'Equipment profile not found'});
  }
  if(method==='POST' && u.pathname==='/api/meal-favourites'){
    const details=favouriteDetails(uid,await json(req));if(!details)return send(res,400,{error:'Choose a name, meal and currently available preferred foods'});
    const result=db.prepare('INSERT INTO meal_favourites(user_id,name,meal,food_ids,portion) VALUES(?,?,?,?,?)').run(uid,details.name,details.meal,JSON.stringify(details.foodIds),details.portion);
    return send(res,201,{id:Number(result.lastInsertRowid)});
  }
  if(method==='PUT' && /^\/api\/meal-favourites\/\d+$/.test(u.pathname)){
    const id=Number(u.pathname.split('/').pop()),details=favouriteDetails(uid,await json(req));if(!details)return send(res,400,{error:'Choose a name, meal and currently available preferred foods'});
    const result=db.prepare('UPDATE meal_favourites SET name=?,meal=?,food_ids=?,portion=? WHERE id=? AND user_id=?').run(details.name,details.meal,JSON.stringify(details.foodIds),details.portion,id,uid);
    return send(res,result.changes?200:404,result.changes?{ok:true}:{error:'Saved meal not found'});
  }
  if(method==='DELETE' && /^\/api\/meal-favourites\/\d+$/.test(u.pathname)){
    const id=Number(u.pathname.split('/').pop()),result=db.prepare('DELETE FROM meal_favourites WHERE id=? AND user_id=?').run(id,uid);
    return send(res,result.changes?200:404,result.changes?{ok:true}:{error:'Saved meal not found'});
  }
  if(method==='POST' && u.pathname==='/api/checkin') { const b=await json(req), p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data), day=b.day||dayFor(p.timezone); db.prepare('INSERT INTO checkins(user_id,day,data) VALUES(?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET data=excluded.data').run(uid,day,JSON.stringify(b)); let existing=db.prepare('SELECT status FROM plans WHERE user_id=? AND day=?').get(uid,day); if(!existing||existing.status==='unstarted') db.prepare('INSERT INTO plans(user_id,day,data,status) VALUES(?,?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET data=excluded.data,status=excluded.status').run(uid,day,JSON.stringify(planFor(b,p,day,planningContext(uid,day,b))),'unstarted'); return send(res,200,{ok:true,day}); }
  if(method==='POST' && u.pathname==='/api/plan/confirm') { const p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data), day=dayFor(p.timezone), c=db.prepare('SELECT data FROM checkins WHERE user_id=? AND day=?').get(uid,day); if(!c) return send(res,400,{error:'Complete today’s check-in first'}); if(db.prepare('SELECT 1 FROM workouts WHERE user_id=? AND day=?').get(uid,day)) return send(res,409,{error:'Resume your saved workout instead of regenerating it.'}); const check=JSON.parse(c.data),plan=planFor(check,p,day,planningContext(uid,day,check)); db.prepare('INSERT INTO plans(user_id,day,data,status) VALUES(?,?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET data=excluded.data,status=excluded.status').run(uid,day,JSON.stringify(plan),'confirmed'); return send(res,200,{ok:true,plan:{...plan,status:'confirmed'}}); }
  if(method==='POST' && u.pathname==='/api/plan/alternative') {
    const p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data),day=dayFor(p.timezone);
    if(db.prepare('SELECT 1 FROM workouts WHERE user_id=? AND day=?').get(uid,day))return send(res,409,{error:'Resume your saved workout; an active or completed workout cannot be replaced.'});
    const checkRow=db.prepare('SELECT data FROM checkins WHERE user_id=? AND day=?').get(uid,day),row=db.prepare('SELECT data,status FROM plans WHERE user_id=? AND day=?').get(uid,day);
    if(!checkRow||!row||row.status!=='confirmed')return send(res,409,{error:'Confirm today’s check-in and plan first.'});
    const check=JSON.parse(checkRow.data),current=JSON.parse(row.data),context=planningContext(uid,day,check);
    const safe=planFor(check,p,day,context);
    if(safe.kind==='safety-stop'||check.pain==='movement-pain'||check.soreness==='high'||(check.energy==='low'&&current.kind!=='recovery-strength'))return send(res,409,{error:'Workout alternatives are unavailable with today’s safety or recovery check-in. Reconfirm the plan if your check-in changed.'});
    if(current.kind==='recovery'||(safe.kind==='recovery'&&current.kind!=='rest-day-override')||!current.exercises?.some(exercise=>exercise.pattern!=='cardio'))return send(res,409,{error:'Keep today’s recovery guidance or choose an eligible rest-day option first.'});
    if(current.kind==='rest-day-override'&&check.energy!=='high')return send(res,409,{error:'A regular workout override requires high energy on today’s check-in.'});
    const plan=alternateWorkoutPlan(current,p,check,context.lastExerciseNames||[]);
    if(!plan)return send(res,409,{error:'No other suitable exercise mix is available with today’s equipment.'});
    db.prepare('UPDATE plans SET data=? WHERE user_id=? AND day=? AND status=?').run(JSON.stringify(plan),uid,day,'confirmed');
    return send(res,200,{ok:true,plan:{...withCatalogOptions(plan,p,check),status:'confirmed'}});
  }
  if(method==='POST' && u.pathname==='/api/plan/rest-day-override') {
    const body=await json(req),mode=body.mode==='regular'?'regular':body.mode==='light'?'light':null;
    if(!mode)return send(res,400,{error:'Choose either a regular workout or an easy walk.'});
    const p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data),day=dayFor(p.timezone);
    if(db.prepare('SELECT 1 FROM workouts WHERE user_id=? AND day=?').get(uid,day))return send(res,409,{error:'Today’s workout has already started or finished; it cannot be replaced.'});
    const checkRow=db.prepare('SELECT data FROM checkins WHERE user_id=? AND day=?').get(uid,day);
    if(!checkRow)return send(res,400,{error:'Complete today’s check-in first.'});
    const check=JSON.parse(checkRow.data),current=db.prepare('SELECT data,status FROM plans WHERE user_id=? AND day=?').get(uid,day),planned=current?JSON.parse(current.data):planFor(check,p,day,planningContext(uid,day,check));
    const urgent=(Number(check.systolic)>=180||Number(check.diastolic)>=120)||['chest-pain','fainting','severe-breathlessness'].includes(check.symptoms);
    if(urgent||planned.kind==='safety-stop'||p.clearance==='restricted'||p.injuries||p.restrictions||check.pain==='movement-pain'||check.soreness==='high'||check.energy==='low')return send(res,409,{error:'An activity override is unavailable with today’s safety, pain, soreness, energy, or clinician-restriction check. Keep the recovery plan and follow its guidance.'});
    if(mode==='regular'&&check.energy!=='high')return send(res,409,{error:'A regular workout override is only available when today’s energy is marked high.'});
    if(planned.kind!=='recovery'||current?.status==='active'||current?.status==='completed')return send(res,409,{error:'This option is only available on an unstarted recovery day.'});
    let plan;
    if(mode==='regular'){
      plan=planFor({...check,trainedYesterday:'no'},p,day,{...planningContext(uid,day,check),daysSinceLastWorkout:0,overrideRecovery:true});
      plan={...plan,kind:'rest-day-override',title:'Regular workout — rest-day override',reason:`${plan.reason} You chose a regular session despite the planned recovery day; do not add catch-up sets or extra sessions.`,safety:'Use a moderate effort and breathe continuously. Stop for chest pain, fainting, severe dizziness, unusual shortness of breath, or movement-related pain.'};
    }else plan={kind:'rest-day-override',title:'Optional easy activity',reason:'You chose to swap today’s rest plan for a short, low-effort walk. This is optional—not catch-up training—and you can stop at any time.',exercises:[{name:'Easy walk',pattern:'cardio',muscles:'cardiorespiratory',sets:1,reps:'10–15 min',rest:'as needed',settings:{speed:'comfortable speaking pace',incline:'0%',effort:'easy; able to speak comfortably'},cue:'Start slowly. Stop and rest if you feel pain, dizziness, unusual breathlessness, or concerning symptoms.',alternatives:'Gentle mobility at a comfortable range.'}],cardio:'10–15 minutes easy, optional',safety:'Do not push the pace or make up missed workouts. Stop for pain, dizziness, unusual breathlessness, or concerning symptoms.'};
    db.prepare('INSERT INTO plans(user_id,day,data,status) VALUES(?,?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET data=excluded.data,status=excluded.status').run(uid,day,JSON.stringify(plan),'confirmed');
    return send(res,200,{ok:true,plan:{...plan,status:'confirmed'}});
  }
  if(method==='POST' && u.pathname==='/api/workout') {
    const b=await json(req), p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data), day=dayFor(p.timezone);
    if(b.day && b.day!==day) return send(res,400,{error:'Use today’s workout'});
    if(!validWorkout(b.data)||!['active','completed'].includes(b.status)) return send(res,400,{error:'Check your workout values'});
    const profileForSet=db.prepare('SELECT exercise_name FROM exercise_profiles WHERE id=? AND user_id=?');
    for(const exercise of b.data.exercises)for(const set of exercise.sets){if(set.equipmentProfileId==null)continue;const id=Number(set.equipmentProfileId),profile=Number.isSafeInteger(id)&&id>0?profileForSet.get(id,uid):null;if(!profile||profile.exercise_name!==exercise.name)return send(res,400,{error:'Choose an equipment profile for this exact exercise'})}
    const plan=db.prepare('SELECT data,status FROM plans WHERE user_id=? AND day=?').get(uid,day);
    const check=db.prepare('SELECT data FROM checkins WHERE user_id=? AND day=?').get(uid,day);
    if(!check||!plan||plan.status!=='confirmed') return send(res,409,{error:'Confirm today’s plan first'});
    if(b.data.exercises.some(exercise=>exercise.unplanned&&(exercise.slot!=null||!['strength','cardio'].includes(exercise.pattern)||!exercise.name.trim()||exercise.name.length>120)))return send(res,400,{error:'Unplanned activity must stay separate from the confirmed plan'});
    let sawUnplanned=false;for(const exercise of b.data.exercises){if(exercise.unplanned)sawUnplanned=true;else if(sawUnplanned)return send(res,400,{error:'Keep unplanned activity after planned exercises'})}
    if(planFor(JSON.parse(check.data),p,day).kind==='safety-stop') return send(res,403,{error:'Exercise is paused by your current safety check-in. History remains available.'});
    const existing=db.prepare('SELECT * FROM workouts WHERE user_id=? AND day=?').get(uid,day);
    if(existing && existing.updated_at!==b.version) return send(res,409,{error:'A newer workout is saved. Reload before editing; your input is still on screen.'});
    const version=crypto.randomUUID();
    const data={...b.data};
    data.planSnapshot=existing?JSON.parse(existing.data).planSnapshot||JSON.parse(plan.data):JSON.parse(plan.data);
    if(b.status==='completed'){
      const completedAt=existing&&existing.status==='completed'?JSON.parse(existing.data).completedAt||now():now();
      data.completedAt=completedAt;
      data.recap=summarizeWorkout(JSON.parse(plan.data),data,completedAt);
    }else{delete data.completedAt;delete data.recap}
    if(existing) db.prepare('UPDATE workouts SET data=?,status=?,updated_at=? WHERE id=?').run(JSON.stringify(data),b.status,version,existing.id);
    else db.prepare('INSERT INTO workouts(user_id,day,data,status,updated_at) VALUES(?,?,?,?,?)').run(uid,day,JSON.stringify(data),b.status,version);
    return send(res,200,{ok:true,version});
  }
  if(method==='POST' && u.pathname==='/api/measurements') { const b=await json(req),p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data),day=String(b.measuredDay||b.measuredAt?.slice(0,10)||dayFor(p.timezone)),value=Number(b.value),max=b.kind==='weight'?1500:b.kind==='waist'?250:b.kind==='blood-pressure'?350:0,units=b.kind==='weight'?['lb','kg']:b.kind==='waist'?['in','cm']:['mmHg'];if(!['weight','waist','blood-pressure'].includes(b.kind)||!Number.isFinite(value)||value<=0||value>max||!units.includes(b.unit)||!validDay(day)||day>dayFor(p.timezone))return send(res,400,{error:'Check the measurement, unit and date'});db.prepare('INSERT INTO measurements(user_id,kind,value,unit,measured_at) VALUES(?,?,?,?,?)').run(uid,b.kind,value,b.unit,day+'T12:00:00.000Z');return send(res,200,{ok:true}); }
  if(method==='POST' && u.pathname==='/api/foods') { const b=await json(req),name=String(b.name||'').trim(),category=b.category||'Other',preference=b.preference||'preferred';if(!name||name.length>120||!['Protein','Carbohydrates','Fruit','Vegetables','Snacks','Drinks','Other'].includes(category)||!['preferred','limited','avoid'].includes(preference)||String(b.notes||'').length>1000)return send(res,400,{error:'Check the food name, category, preference and notes'});db.prepare('INSERT INTO foods(user_id,name,category,preference,notes,available) VALUES(?,?,?,?,?,?)').run(uid,name,category,preference,String(b.notes||''),b.available===false?0:1);return send(res,200,{ok:true}); }
  if(method==='PUT' && u.pathname.startsWith('/api/foods/')) { const id=Number(u.pathname.split('/').pop()),b=await json(req),name=String(b.name||'').trim();if(!Number.isSafeInteger(id)||id<1||!name||name.length>120||!['Protein','Carbohydrates','Fruit','Vegetables','Snacks','Drinks','Other'].includes(b.category)||!['preferred','limited','avoid'].includes(b.preference)||String(b.notes||'').length>1000||![true,false,0,1].includes(b.available))return send(res,400,{error:'Check the food inventory details'});const result=db.prepare('UPDATE foods SET name=?,category=?,preference=?,notes=?,available=? WHERE id=? AND user_id=?').run(name,b.category,b.preference,String(b.notes||''),b.available===true||b.available===1?1:0,id,uid);return send(res,result.changes?200:404,result.changes?{ok:true}:{error:'Food not found'}); }
  if(method==='POST' && u.pathname==='/api/food-log') { const b=await json(req),p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data),day=b.day||dayFor(p.timezone);if(!validDay(day)||day>dayFor(p.timezone))return send(res,400,{error:'Choose a valid date up to today'});if(!['breakfast','lunch','dinner','snack'].includes(b.meal)||!String(b.item||'').trim()||String(b.item).length>240||String(b.portion||'').length>240||String(b.notes||'').length>2000)return send(res,400,{error:'Check the meal, food and portion details'});db.prepare('INSERT INTO food_logs(user_id,day,meal,item,portion,notes,created_at) VALUES(?,?,?,?,?,?,?)').run(uid,day,b.meal,String(b.item).trim(),b.portion||'',b.notes||'',now());return send(res,200,{ok:true}); }
  if(method==='POST' && u.pathname==='/api/sleep') { const b=await json(req),hours=Number(b.hours),p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data),day=b.day||dayFor(p.timezone);if(!validDay(day)||day>dayFor(p.timezone))return send(res,400,{error:'Choose a valid date up to today'});if(!Number.isFinite(hours)||hours<0||hours>24||!['good','okay','poor'].includes(b.quality||'okay')||String(b.notes||'').length>2000)return send(res,400,{error:'Check the sleep hours, quality and notes'});db.prepare('INSERT INTO sleep_logs(user_id,day,hours,quality,notes,created_at) VALUES(?,?,?,?,?,?)').run(uid,day,hours,b.quality||'okay',b.notes||'',now());return send(res,200,{ok:true}); }
  if(method==='POST' && u.pathname==='/api/activity') { const b=await json(req),p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data),day=b.day||dayFor(p.timezone),duration=b.duration===''||b.duration==null?null:Number(b.duration),distance=b.distance===''||b.distance==null?null:Number(b.distance),steps=b.steps===''||b.steps==null?null:Number(b.steps);if(!validDay(day)||day>dayFor(p.timezone))return send(res,400,{error:'Choose a valid date up to today'});if(!String(b.kind||'').trim()||String(b.kind).length>80||String(b.notes||'').length>2000||duration!==null&&(!Number.isFinite(duration)||duration<0||duration>1440)||distance!==null&&(!Number.isFinite(distance)||distance<0||distance>1000)||steps!==null&&(!Number.isInteger(steps)||steps<0||steps>150000))return send(res,400,{error:'Check the activity details'});db.prepare('INSERT INTO activity_logs(user_id,day,kind,duration,distance,steps,notes,created_at) VALUES(?,?,?,?,?,?,?,?)').run(uid,day,String(b.kind).trim(),duration,distance,steps,b.notes||'',now());return send(res,200,{ok:true}); }
  if(method==='GET' && u.pathname==='/api/uploads') { const rows=db.prepare('SELECT id,day,mime,bytes,caption,kind,created_at FROM uploads WHERE user_id=? ORDER BY day DESC,created_at DESC').all(uid); return send(res,200,{uploads:rows}); }
  if(method==='POST' && u.pathname==='/api/uploads') { const b=await json(req); const raw=String(b.data||''); const m=raw.match(/^data:(image\/(?:png|jpeg|jpg));base64,([A-Za-z0-9+/]+={0,2})$/i); if(!m) return send(res,400,{error:'Upload a PNG or JPEG image'}); const mime=m[1].toLowerCase()==='image/jpg'?'image/jpeg':m[1].toLowerCase(); const buf=Buffer.from(m[2],'base64'); if(buf.toString('base64').replace(/=+$/,'')!==m[2].replace(/=+$/,''))return send(res,400,{error:'Invalid image encoding'}); if(buf.length<16||buf.length>5*1024*1024) return send(res,400,{error:'Image must be between 16 bytes and 5 MB'}); const dimensions=imageDimensions(buf,mime); if(!dimensions) return send(res,400,{error:'The image file is incomplete or invalid'}); if(dimensions.width>8000||dimensions.height>8000||dimensions.width*dimensions.height>25_000_000)return send(res,400,{error:'Image dimensions are too large. Use an image up to 25 megapixels.'}); const clean=stripImageMetadata(buf,mime); const p=JSON.parse(db.prepare('SELECT data FROM profiles WHERE user_id=?').get(uid).data); const day=b.day||dayFor(p.timezone),kind=b.kind??'screenshot'; if(!validDay(day)||!['screenshot','progress-photo'].includes(kind))return send(res,400,{error:'Choose a valid date and image type'}); const filename=`${crypto.randomBytes(24).toString('hex')}.${mime==='image/png'?'png':'jpg'}`; fs.writeFileSync(path.join(UPLOADS,filename),clean,{flag:'wx',mode:0o600}); const info=db.prepare('INSERT INTO uploads(user_id,day,filename,mime,bytes,caption,kind,created_at) VALUES(?,?,?,?,?,?,?,?)').run(uid,day,filename,mime,clean.length,String(b.caption||'').slice(0,240),kind,now()); return send(res,201,{id:info.lastInsertRowid,day,mime,bytes:clean.length,kind}); }
  if(method==='GET' && u.pathname.startsWith('/api/uploads/')) { const id=Number(u.pathname.split('/').pop()); const row=db.prepare('SELECT filename,mime FROM uploads WHERE id=? AND user_id=?').get(id,uid); if(!row) return send(res,404,{error:'Image not found'}); const file=path.join(UPLOADS,row.filename); if(!fs.existsSync(file)) return send(res,404,{error:'Image not found'}); res.writeHead(200,{'Content-Type':row.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}); return res.end(fs.readFileSync(file)); }
  if(method==='PUT' && u.pathname.startsWith('/api/uploads/')) { const id=Number(u.pathname.split('/').pop()); const b=await json(req), caption=String(b.caption||'').trim(),current=db.prepare('SELECT day,kind FROM uploads WHERE id=? AND user_id=?').get(id,uid); if(!current)return send(res,404,{error:'Image not found'});const day=b.day??current.day,kind=b.kind??current.kind;if(caption.length>240)return send(res,400,{error:'Captions are limited to 240 characters'});if(!validDay(day)||!['screenshot','progress-photo'].includes(kind))return send(res,400,{error:'Check the image date and type'});db.prepare('UPDATE uploads SET caption=?,day=?,kind=? WHERE id=? AND user_id=?').run(caption,day,kind,id,uid);return send(res,200,{ok:true}); }
  if(method==='DELETE' && u.pathname.startsWith('/api/uploads/')) { const id=Number(u.pathname.split('/').pop()); const row=db.prepare('SELECT filename FROM uploads WHERE id=? AND user_id=?').get(id,uid); if(!row) return send(res,404,{error:'Image not found'}); db.prepare('DELETE FROM uploads WHERE id=? AND user_id=?').run(id,uid); try{fs.rmSync(path.join(UPLOADS,row.filename),{force:true})}catch{} return send(res,200,{ok:true}); }
  if(method==='DELETE' && u.pathname.startsWith('/api/foods/')) { db.prepare('DELETE FROM foods WHERE id=? AND user_id=?').run(Number(u.pathname.split('/').pop()),uid); return send(res,200,{ok:true}); }
  if(method==='GET' && u.pathname==='/api/print-summary') { const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const workouts=db.prepare('SELECT day,data,status FROM workouts WHERE user_id=? ORDER BY day DESC LIMIT 120').all(uid);const measures=db.prepare('SELECT kind,value,unit,measured_at FROM measurements WHERE user_id=? ORDER BY measured_at DESC LIMIT 250').all(uid);const reviews=db.prepare('SELECT day,data FROM day_reviews WHERE user_id=? ORDER BY day DESC LIMIT 365').all(uid).map(r=>({...JSON.parse(r.data),day:r.day}));const out=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Steady progress summary</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:900px;margin:32px auto;padding:0 20px;color:#17312d}h1,h2{color:#123b35}.muted{color:#60716b}.day{break-inside:avoid;border-top:1px solid #ddd;padding:8px 0}table{border-collapse:collapse;width:100%}td,th{text-align:left;border-bottom:1px solid #ddd;padding:7px}@media print{body{margin:0 auto}.noprint{display:none}}</style><main><h1>Steady progress summary</h1><p class="muted">Generated ${escHtml(now())}. Save or print this page as PDF from your browser. It includes only records entered in the app.</p><h2>Workouts</h2>${workouts.map(w=>`<section class="day"><h3>${escHtml(w.day)} · ${escHtml(w.status)}</h3>${JSON.parse(w.data).exercises.map(ex=>`<p><strong>${escHtml(ex.name)}</strong>: ${(ex.sets||[]).map((s,i)=>s.duration!=null?`Cardio ${escHtml(s.duration)} min${s.distance?`, ${escHtml(s.distance)} ${escHtml(s.distanceUnit||'')}`:''}`:`Set ${i+1}: ${escHtml(s.weight||'—')} ${escHtml(s.unit||'')} × ${escHtml(s.reps||'—')}`).join(' · ')||'No sets logged'}</p>`).join('')}</section>`).join('')||'<p>No saved workouts.</p>'}<h2>Measurements</h2><table><tr><th>Date</th><th>Type</th><th>Value</th></tr>${measures.map(x=>`<tr><td>${escHtml(String(x.measured_at).slice(0,10))}</td><td>${escHtml(x.kind)}</td><td>${escHtml(x.value)} ${escHtml(x.unit)}</td></tr>`).join('')||'<tr><td colspan="3">No measurements.</td></tr>'}</table><h2>Daily reviews</h2><table><tr><th>Date</th><th>Workout</th><th>Cardio</th><th>Food</th><th>Steps</th><th>Energy / soreness</th></tr>${reviews.map(r=>`<tr><td>${escHtml(r.day)}</td><td>${escHtml(r.workout)}</td><td>${escHtml(r.cardio)}</td><td>${escHtml(r.food)}</td><td>${escHtml(r.steps??'—')}</td><td>${escHtml(r.energy)} / ${escHtml(r.soreness)}</td></tr>`).join('')||'<tr><td colspan="6">No daily reviews.</td></tr>'}</table><p class="noprint">Use your browser’s Print command to save a PDF.</p></main></html>`;return send(res,200,out,'text/html; charset=utf-8'); }
  if(method==='GET' && u.pathname==='/api/export.csv') { const lines=[['record_type','date','field','exercise','detail','value','unit','notes'].map(csv).join(',')],add=(...cells)=>lines.push(cells.map(csv).join(','));for(const r of db.prepare('SELECT day,data FROM checkins WHERE user_id=? ORDER BY day').all(uid))add('check-in',r.day,'check-in','','',r.data,'','');for(const r of db.prepare('SELECT day,status,data FROM plans WHERE user_id=? ORDER BY day').all(uid))add('plan',r.day,r.status,'','',r.data,'','');for(const w of db.prepare('SELECT day,status,data FROM workouts WHERE user_id=? ORDER BY day').all(uid)){const d=JSON.parse(w.data);add('workout',w.day,w.status,'','', '', '','');for(const ex of d.exercises||[]){if(!ex.sets?.length)add('exercise',w.day,'planned',ex.name,'','','','');for(const [i,s] of (ex.sets||[]).entries())add('set',w.day,`set ${i+1}`,ex.name,s.duration!=null?'cardio':'strength',s.duration??s.weight??'',s.duration!=null?(s.distanceUnit||'min'):(s.unit||''),JSON.stringify(s))}}for(const m of db.prepare('SELECT kind,value,unit,measured_at FROM measurements WHERE user_id=? ORDER BY measured_at').all(uid))add('measurement',String(m.measured_at).slice(0,10),m.kind,'','',m.value,m.unit,'');for(const r of db.prepare('SELECT day,data FROM day_reviews WHERE user_id=? ORDER BY day').all(uid)){const d=JSON.parse(r.data);for(const [k,v] of Object.entries(d))add('daily-review',r.day,k,'','',typeof v==='object'?JSON.stringify(v):v,'','')}for(const r of db.prepare('SELECT day,meal,item,portion,notes FROM food_logs WHERE user_id=? ORDER BY day,id').all(uid))add('food',r.day,r.meal,r.item,r.portion,'','',''+r.notes);for(const r of db.prepare('SELECT day,hours,quality,notes FROM sleep_logs WHERE user_id=? ORDER BY day,id').all(uid))add('sleep',r.day,r.quality,'','',r.hours,'hours',r.notes);for(const r of db.prepare('SELECT day,kind,duration,distance,steps,notes FROM activity_logs WHERE user_id=? ORDER BY day,id').all(uid))add('activity',r.day,r.kind,'',r.distance??'',r.duration??r.steps??'',r.distance==null?'minutes/steps':'distance',r.notes);for(const w of db.prepare('SELECT day,data FROM workouts WHERE user_id=? AND status=? ORDER BY day').all(uid,'completed')){const recap=JSON.parse(w.data).recap;if(!recap)continue;add('workout-recap',w.day,'summary','', 'duration',recap.durationMinutes??'', 'minutes',JSON.stringify({counts:recap.counts,cardioMinutes:recap.cardioMinutes,completedAt:recap.completedAt}));for(const entry of recap.entries||[])add('workout-recap',w.day,entry.status,entry.name,entry.kind,entry.logged,entry.kind==='cardio'?'entries':'sets',JSON.stringify({planned:entry.planned,cardioMinutes:entry.cardioMinutes}))};for(const favourite of db.prepare('SELECT name,meal,food_ids,portion FROM meal_favourites WHERE user_id=? ORDER BY name').all(uid))add('saved-meal','',favourite.meal,favourite.name,JSON.parse(favourite.food_ids).join('+'),'','food IDs',favourite.portion);const out=lines.join('\r\n')+'\r\n';res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename=fitness-progress.csv','Cache-Control':'no-store'});return res.end(out); }
  send(res,404,{error:'Not found'});
}
function csv(v){let s=String(v??'');if(/^[\u0000-\u0020]*[=+@-]/.test(s))s="'"+s;return `"${s.replaceAll('"','""')}"`};
function login(res,id){establishSession(res,id); return send(res,200,{ok:true});}
function takeAttempt(key,limit,windowMs){const now=Date.now(),current=attempts.get(key);if(!current||now>=current.until){attempts.set(key,{count:1,until:now+windowMs});return true}if(current.count>=limit)return false;current.count++;return true}
function planningContext(uid,day,check){
  const start=new Date(day+'T12:00:00Z');start.setUTCDate(start.getUTCDate()-6);const first=start.toISOString().slice(0,10);
  const recent=db.prepare("SELECT day,status,data FROM workouts WHERE user_id=? AND day>=? AND day<? AND status IN ('active','completed') ORDER BY day DESC").all(uid,first,day).filter(w=>w.status==='completed'||JSON.parse(w.data).exercises?.some(ex=>ex.sets?.length));
  const cardioStart=new Date(day+'T12:00:00Z');cardioStart.setUTCDate(cardioStart.getUTCDate()-180);const cardioFirst=cardioStart.toISOString().slice(0,10);
  const rows=db.prepare("SELECT w.data AS workout_data,p.data AS plan_data FROM workouts w JOIN plans p ON p.user_id=w.user_id AND p.day=w.day WHERE w.user_id=? AND w.day>=? AND w.day<? AND w.status='completed' ORDER BY w.day DESC LIMIT 40").all(uid,cardioFirst,day);
  const cardioSessions=[];
  for(const row of rows){const workout=JSON.parse(row.workout_data),plan=JSON.parse(row.plan_data),planned=plan.exercises?.find(ex=>ex.name==='Treadmill walk'&&ex.pattern==='cardio'),actual=workout.exercises?.find(ex=>ex.name==='Treadmill walk'&&ex.pattern==='cardio');if(!planned||!actual)continue;const targetMinutes=Number(planned.targetMinutes),actualMinutes=(actual.sets||[]).reduce((sum,set)=>sum+(Number.isFinite(Number(set.duration))?Math.max(0,Number(set.duration)):0),0);if(targetMinutes>0&&actualMinutes>0)cardioSessions.push({targetMinutes,actualMinutes});if(cardioSessions.length>=3)break}
  const templateRows=db.prepare("SELECT day,status,data FROM workouts WHERE user_id=? AND day<? AND status IN ('active','completed') ORDER BY day DESC LIMIT 366").all(uid,day).map(w=>({...w,data:JSON.parse(w.data)}));
  return{...trainingContext(templateRows,day,check),sessionsInLast7:recent.length,cardioSessions};
}
function imageDimensions(buf,mime){
  if(mime==='image/png'&&buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&buf.toString('ascii',12,16)==='IHDR')return{width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
  if(mime!=='image/jpeg'||buf[0]!==0xff||buf[1]!==0xd8)return null;
  let i=2;while(i+4<buf.length){if(buf[i]!==0xff)return null;while(buf[i]===0xff)i++;const marker=buf[i++];if(marker===0xd9||marker===0xda)break;if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;if(i+2>buf.length)return null;const length=buf.readUInt16BE(i);if(length<2||i+length>buf.length)return null;if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){if(length<7)return null;return{height:buf.readUInt16BE(i+3),width:buf.readUInt16BE(i+5)}}i+=length;}return null;
}
function stripImageMetadata(buf,mime){
  if(mime==='image/png'){const chunks=[buf.subarray(0,8)],remove=new Set(['tEXt','zTXt','iTXt','eXIf','tIME']);let i=8;while(i+12<=buf.length){const len=buf.readUInt32BE(i),end=i+12+len;if(end>buf.length)break;const type=buf.toString('ascii',i+4,i+8);if(!remove.has(type))chunks.push(buf.subarray(i,end));i=end;if(type==='IEND')break;}return Buffer.concat(chunks)}
  const chunks=[buf.subarray(0,2)],remove=new Set([0xe1,0xed,0xfe]);let i=2;while(i+4<=buf.length){const start=i;if(buf[i]!==0xff)break;while(buf[i]===0xff)i++;const marker=buf[i++];if(marker===0xda||marker===0xd9){chunks.push(buf.subarray(start));return Buffer.concat(chunks)}if(marker===0x01||(marker>=0xd0&&marker<=0xd7)){chunks.push(buf.subarray(start,i));continue}const length=buf.readUInt16BE(i),end=i+length;if(length<2||end>buf.length)break;if(!remove.has(marker))chunks.push(buf.subarray(start,end));i=end;}return Buffer.concat(chunks);
}
async function performBackup() {
  if (!backupContainer) throw new Error('Private backup storage is not configured');
  if (backupState.running) throw new Error('A backup is already running');
  backupState.running = true;
  backupState.lastError = null;
  try {
    const result = await createPrivateBackup({ database: db, uploadsDirectory: UPLOADS, container: backupContainer, retentionDays: Number(process.env.BACKUP_RETENTION_DAYS || 30) });
    const verified = await verifyLatestPrivateBackup({ container: backupContainer });
    backupState.lastBackup = result.createdAt;
    backupState.lastVerification = verified.createdAt;
    return { ...result, verified: true };
  } catch (error) {
    backupState.lastError = 'Backup or restore verification failed';
    console.error('[private-backup] failed', error?.code || error?.statusCode || 'unknown');
    throw error;
  } finally {
    backupState.running = false;
  }
}
if (backupContainer && process.env.NODE_ENV === 'production') {
  const scheduledBackup = async () => {
    if (backupState.running || (backupState.lastBackup && Date.now() - Date.parse(backupState.lastBackup) < 24 * 60 * 60 * 1000)) return;
    try { await performBackup(); } catch { /* retry on the next hourly check */ }
  };
  const startupTimer = setTimeout(scheduledBackup, 30_000); startupTimer.unref();
  const retryTimer = setInterval(scheduledBackup, 60 * 60 * 1000); retryTimer.unref();
}
if(pushReminders.configured&&process.env.NODE_ENV==='production'){
  const timer=setInterval(()=>pushReminders.sendDue().catch(()=>{}),60_000);timer.unref();
}
const server=http.createServer((req,res)=>route(req,res).catch(e=>send(res,e.status||500,{error:e.status?e.message:'Request failed'}))); if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) server.listen(PORT,()=>console.log(`Fitness tracker listening on http://localhost:${PORT}`));
export { planFor, dayFor, passwordHash, passwordOk, easyAuthPrincipal, server };
