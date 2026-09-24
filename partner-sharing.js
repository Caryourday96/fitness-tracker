import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const starterFoods=[['Lean ground beef','Protein'],['Chicken','Protein'],['Chicken breast','Protein'],['Egg whites','Protein'],['Yogurt','Protein'],['Oats','Carbohydrates'],['Sweet potatoes','Carbohydrates'],['Bananas','Fruit'],['Other fruit','Fruit'],['Costco vegetable mix','Vegetables'],['Costco root vegetable mix','Vegetables']];

export function initializePartnerSharing(db){
  db.exec('CREATE TABLE IF NOT EXISTS partner_links(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,token_hash TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL,revoked_at TEXT)');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS one_active_partner_link_per_user ON partner_links(user_id) WHERE revoked_at IS NULL');
  try{db.exec('ALTER TABLE users ADD COLUMN starter_foods_seeded INTEGER NOT NULL DEFAULT 0')}catch{}
  for(const user of db.prepare('SELECT id FROM users').all())seedStarterFoods(db,user.id);
}

export function seedStarterFoods(db,userId){
  const user=db.prepare('SELECT starter_foods_seeded FROM users WHERE id=?').get(userId);
  if(!user||user.starter_foods_seeded)return;
  const insert=db.prepare("INSERT INTO foods(user_id,name,category,preference,notes,available) SELECT ?,?,?, 'preferred','',1 WHERE NOT EXISTS(SELECT 1 FROM foods WHERE user_id=? AND lower(trim(name))=lower(?))");
  for(const [name,category] of starterFoods)insert.run(userId,name,category,userId,name);
  db.prepare('UPDATE users SET starter_foods_seeded=1 WHERE id=?').run(userId);
}

function publicHeaders(res){res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Referrer-Policy','no-referrer');}
function numeric(value){return typeof value==='number'&&Number.isFinite(value)?value:null}

export async function handlePublicPartner(req,res,{db,hash,send,root,json}){
  if(req.method==='GET'&&req.url.split('?')[0]==='/partner'){publicHeaders(res);res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");send(res,200,fs.readFileSync(path.join(root,'public','partner.html'),'utf8'),'text/html; charset=utf-8');return true}
  if(req.method==='POST'&&req.url.split('?')[0]==='/api/shared-workouts'){publicHeaders(res);const body=await json(req,2048),token=String(body.token||'');if(!/^[A-Za-z0-9_-]{43}$/.test(token)){send(res,404,{error:'This workout link is invalid or has been revoked.'});return true}const link=db.prepare('SELECT user_id FROM partner_links WHERE token_hash=? AND revoked_at IS NULL').get(hash(token));if(!link){send(res,404,{error:'This workout link is invalid or has been revoked.'});return true}const workouts=db.prepare("SELECT day,data FROM workouts WHERE user_id=? AND status='completed' ORDER BY day DESC LIMIT 60").all(link.user_id).map(row=>{let data={};try{data=JSON.parse(row.data)}catch{};return{day:row.day,exercises:(Array.isArray(data.exercises)?data.exercises:[]).slice(0,30).filter(ex=>ex&&typeof ex==='object').map(ex=>({name:String(ex.name||'Exercise').slice(0,120),sets:(Array.isArray(ex.sets)?ex.sets:[]).slice(0,30).filter(s=>s&&typeof s==='object').map(s=>({reps:numeric(s.reps),weight:numeric(s.weight),unit:['lb','kg'].includes(s.unit)?s.unit:null,duration:numeric(s.duration),distance:numeric(s.distance),distanceUnit:['km','mi','m'].includes(s.distanceUnit)?s.distanceUnit:null,incline:numeric(s.incline)})).filter(s=>Object.values(s).some(v=>v!==null))}))}});send(res,200,{workouts});return true}
  return false;
}

export function handleOwnerShare(req,res,{db,userId,hash,now,send,origin}){
  if(req.method==='GET'&&req.url==='/api/share/status'){const row=db.prepare('SELECT created_at FROM partner_links WHERE user_id=? AND revoked_at IS NULL').get(userId);send(res,200,{active:!!row,createdAt:row?.created_at||null});return true}
  if(req.method==='POST'&&req.url==='/api/share/create'){const token=crypto.randomBytes(32).toString('base64url'),created=now();db.exec('BEGIN IMMEDIATE');try{db.prepare('UPDATE partner_links SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL').run(created,userId);db.prepare('INSERT INTO partner_links(user_id,token_hash,created_at) VALUES(?,?,?)').run(userId,hash(token),created);db.exec('COMMIT')}catch(error){db.exec('ROLLBACK');throw error}send(res,200,{active:true,createdAt:created,url:`${origin}/partner#${token}`});return true}
  if(req.method==='POST'&&req.url==='/api/share/revoke'){db.prepare('UPDATE partner_links SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL').run(now(),userId);send(res,200,{active:false});return true}
  return false;
}
