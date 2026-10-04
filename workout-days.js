import fs from 'node:fs';
import path from 'node:path';
import {workoutCalendar,consistencyInsights} from './public/fitdays-data.js';

const publicHost = 'fitdays.adeticket.com';

function publicHeaders(res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
}

function localDay(timezone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function handlePublicWorkoutDays(req, res, { db, send, root }) {
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  if (host !== publicHost) return false;

  let url;
  try { url = new URL(req.url, `https://${publicHost}`); }
  catch { return false; }

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    publicHeaders(res);
    send(res, 200, fs.readFileSync(path.join(root, 'public', 'fitdays.html'), 'utf8'), 'text/html; charset=utf-8');
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/public-workout-days') {
    publicHeaders(res);
    const owner = db.prepare('SELECT id FROM users ORDER BY id LIMIT 1').get();
    const profile = owner ? db.prepare('SELECT data FROM profiles WHERE user_id=?').get(owner.id) : null;
    let timezone = 'UTC';
    try { timezone = profile ? JSON.parse(profile.data).timezone || 'UTC' : 'UTC'; } catch {}
    const today = localDay(timezone);
    const cutoff = new Date(`${today}T12:00:00Z`);
    cutoff.setUTCDate(cutoff.getUTCDate() - 364);
    const start = cutoff.toISOString().slice(0, 10);
    const days = owner
      ? db.prepare("SELECT day FROM workouts WHERE user_id=? AND status='completed' AND day BETWEEN ? AND ? ORDER BY day").all(owner.id, start, today).map(row => row.day)
      : [];
    const visibility=owner&&db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='fitdays_settings'").get()?db.prepare('SELECT visibility FROM fitdays_settings WHERE user_id=?').get(owner.id)?.visibility||'dates':'dates';
    if(visibility==='counts'){const c=workoutCalendar({today,days});send(res,200,{today,visibility,counts:{week:c.week,month:c.month,year:c.year,calendarYear:c.calendarYear},insights:consistencyInsights({today,days})})}else send(res, 200, { today, days, visibility:'dates' });
    return true;
  }
  return false;
}
