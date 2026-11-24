import fs from 'node:fs';
import path from 'node:path';
import {workoutCalendar,consistencyInsights,weeklyCounts,periodCalendar,periodWeeks,monthlyRecaps,recordedBests,yearRecaps} from './public/fitdays-data.js';
import { validDay } from './progress.js';

const publicHost = 'fitdays.adeticket.com';
const firstMovatiDay = '2026-09-01';

function publicHeaders(res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
}

function localDay(timezone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function initializeMovatiVisits(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS fitdays_movati_visits (
    user_id INTEGER NOT NULL REFERENCES users(id),
    day TEXT NOT NULL,
    PRIMARY KEY (user_id, day)
  )`);
}

export function movatiVisitCount(db, userId) {
  if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='fitdays_movati_visits'").get()) return 0;
  return db.prepare('SELECT COUNT(*) AS count FROM fitdays_movati_visits WHERE user_id=?').get(userId).count;
}

export function importMovatiDates(db, userId, dates, today) {
  if (!Array.isArray(dates) || !dates.length || dates.length > 5000 ||
      dates.some(day => !validDay(day) || day > today)) return null;
  const eligible = dates.filter(day => day >= firstMovatiDay);
  const unique = new Set(eligible);
  const save = db.prepare('INSERT INTO fitdays_movati_visits (user_id, day) VALUES (?, ?) ON CONFLICT DO NOTHING');
  let added = 0;
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const day of unique) added += Number(save.run(userId, day).changes);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return { added, total: movatiVisitCount(db, userId), excluded: dates.length - eligible.length };
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
    if (owner && movatiVisitCount(db, owner.id)) {
      const days = db.prepare('SELECT day FROM fitdays_movati_visits WHERE user_id=? AND day BETWEEN ? AND ?')
        .all(owner.id, start > firstMovatiDay ? start : firstMovatiDay, today).map(row => row.day);
      const data = { today, days };
      const totals = workoutCalendar(data);
      send(res, 200, {
        today,
        source: 'movati',
        visibility: 'counts',
        counts: { week: totals.week, month: totals.month, year: totals.year, calendarYear: totals.calendarYear },
        insights: consistencyInsights(data),
        years: yearRecaps(data),
        recaps: monthlyRecaps(data),
        weeks: weeklyCounts(data),
        windowWeeks: Object.fromEntries([7,30,90,365].map(length => [length,periodWeeks(data,length)])),
        periods: Object.fromEntries([7,30,90,365].map(length => [length,periodCalendar(data,length).days.size]))
      });
      return true;
    }
    const days = owner
      ? db.prepare("SELECT day FROM workouts WHERE user_id=? AND status='completed' AND day BETWEEN ? AND ? ORDER BY day").all(owner.id, start, today).map(row => row.day)
      : [];
    const visibility=owner&&db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='fitdays_settings'").get()?db.prepare('SELECT visibility FROM fitdays_settings WHERE user_id=?').get(owner.id)?.visibility||'dates':'dates';
    if(visibility==='counts'){const c=workoutCalendar({today,days});send(res,200,{today,visibility,counts:{week:c.week,month:c.month,year:c.year,calendarYear:c.calendarYear},insights:consistencyInsights({today,days}),weeks:weeklyCounts({today,days}),years:yearRecaps({today,days}),bests:recordedBests({today,days}),recaps:monthlyRecaps({today,days}),windowWeeks:Object.fromEntries([7,30,90,365].map(length=>[length,periodWeeks({today,days},length)])),periods:Object.fromEntries([7,30,90,365].map(length=>[length,periodCalendar({today,days},length).days.size]))})}else send(res, 200, { today, days, visibility:'dates' });
    return true;
  }
  return false;
}
