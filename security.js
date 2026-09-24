// Trust these headers only behind Azure App Service's enabled authentication proxy.
export function googleIdentity(headers, env = process.env) {
  if (env.NODE_ENV !== 'production' || !env.WEBSITE_SITE_NAME) return null;
  try {
    const p = JSON.parse(Buffer.from(headers['x-ms-client-principal'] || '', 'base64').toString());
    if (p.auth_typ !== 'google' || !Array.isArray(p.claims)) return null;
    const claim = (...types) => p.claims.find(c => types.includes(c.typ))?.val;
    const subject = claim('sub', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier');
    const email = claim('email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress');
    if (!subject || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
    return { subject, email: email.toLowerCase() };
  } catch { return null; }
}
export function allowedWrite(req, origin) {
  return req.headers.origin === origin && req.headers['x-requested-with'] === 'Steady' &&
    String(req.headers['content-type'] || '').startsWith('application/json');
}
export function validWorkout(data) {
  return data && Array.isArray(data.exercises) && data.exercises.length <= 30 && data.exercises.every(e =>
    typeof e.name === 'string' && Array.isArray(e.sets) && e.sets.length <= 100 && e.sets.every(s =>
      ['weight','reps','duration','distance','incline','speed'].every(k => s[k] == null || s[k] === '' ||
        (Number.isFinite(Number(s[k])) && Number(s[k]) >= 0 && Number(s[k]) <= 10000))));
}
