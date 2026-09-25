const SHELL='steady-offline-shell-v1';
const ASSETS=['/offline.html','/static/app.css','/static/steady-icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('steady-offline-shell-')&&key!==SHELL).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate')return;
  event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));
});
self.addEventListener('push',event=>{
  const message=event.data?.json()||{};
  event.waitUntil(self.registration.showNotification('Steady',{body:message.body||'A gentle reminder to check in when it suits you.',icon:'/static/steady-icon.svg',tag:'steady-check-in',data:{url:'/'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{const existing=clients.find(client=>new URL(client.url).origin===self.location.origin);if(existing)return existing.focus();return self.clients.openWindow('/')}));
});
