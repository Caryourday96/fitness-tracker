const CACHE='steady-public-shell-v1';
const ASSETS=['/','/manifest.webmanifest','/static/app.css','/static/app.js','/static/share.js','/static/workout-recap.js','/static/progress-charts.js','/static/rest-timer.js','/static/steady-icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('steady-public-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='CLEAR_SHELL')event.waitUntil(caches.delete(CACHE))});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/.auth/'))return;
  if(!ASSETS.includes(url.pathname))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    try{const response=await fetch(request);if(response.ok&&response.type==='basic')await cache.put(request,response.clone());return response}
    catch(error){const cached=await cache.match(request);if(cached)return cached;throw error}
  }));
});
