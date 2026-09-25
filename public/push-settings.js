const decodeKey=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),character=>character.charCodeAt(0));

export async function renderPushSettings(panel,api){
  if(panel.querySelector('#pushSettings'))return;
  const section=document.createElement('section');section.id='pushSettings';section.innerHTML='<hr><h2>iPhone notifications</h2><p class="muted">Optional, generic check-in reminders at the time saved above. Open Steady from your iPhone Home Screen to enable notifications. No health details appear in a notification.</p><p id="pushStatus" role="status">Checking availability…</p><div class="actions"><button type="button" class="ghost" id="enablePush">Enable on this iPhone</button><button type="button" class="ghost" id="disablePush">Disable on this iPhone</button></div>';
  panel.append(section);
  const status=section.querySelector('#pushStatus'),enable=section.querySelector('#enablePush'),disable=section.querySelector('#disablePush');
  let config;
  try{config=await api('/api/push/config',{method:'GET'})}catch(error){status.textContent=error.message;enable.disabled=true;disable.disabled=true;return}
  const supported='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
  if(!config.available){status.textContent='Push delivery is not configured on the server yet. In-app reminders still work while Steady is open.';enable.disabled=true;disable.disabled=true;return}
  if(!supported){status.textContent='This browser does not support web push. On iPhone, launch Steady from its Home Screen icon.';enable.disabled=true;disable.disabled=true;return}
  const refresh=async()=>{const registration=await navigator.serviceWorker.ready,subscription=await registration.pushManager.getSubscription();status.textContent=subscription?'Enabled on this device. You can turn it off below.':'Off on this device. Enable only if you want gentle notifications.';enable.disabled=!!subscription;disable.disabled=!subscription};
  try{await refresh()}catch{status.textContent='Push service is not ready. Reload Steady and try again.';enable.disabled=true;disable.disabled=true}
  enable.onclick=async()=>{
    try{
      // iOS requires this permission request to follow the button tap directly.
      const permission=await Notification.requestPermission();
      if(permission!=='granted'){status.textContent='Notifications were not allowed. You can change this in iPhone Settings.';return}
      const registration=await navigator.serviceWorker.ready;
      const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeKey(config.publicKey)});
      try{await api('/api/push/subscription',{method:'POST',body:JSON.stringify({subscription:subscription.toJSON()})})}catch(error){await subscription.unsubscribe();throw error}
      await refresh();
    }catch(error){status.textContent=error.message||'Could not enable notifications.'}
  };
  disable.onclick=async()=>{
    try{const registration=await navigator.serviceWorker.ready,subscription=await registration.pushManager.getSubscription();if(!subscription)return refresh();await api('/api/push/subscription',{method:'DELETE',body:JSON.stringify({endpoint:subscription.endpoint})});await subscription.unsubscribe();await refresh()}catch(error){status.textContent=error.message||'Could not disable notifications.'}
  };
}
