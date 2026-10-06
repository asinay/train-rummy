(function(){
 const root=document.documentElement;
 let current='classic',busy=false,refreshing=false;
 const themes={classic:{name:'Classic',color:'#f5f0e8'},halloween:{name:'🎃 Halloween',color:'#150d20'},fall:{name:'🍂 Fall',color:'#f6eddd'},winter:{name:'❄️ Winter',color:'#edf5fa'}};
 const seasonalLabels={fall:['🍂 The Autumn Express','🍁 Train Rummy','All aboard the Autumn Express','🍂 Train Rummy · Autumn Ride','🍁 All-Time Stats','Last stop: a golden autumn victory!'],winter:['❄️ The Snowbound Express','❄️ Train Rummy','All aboard the Snowbound Express','❄️ Train Rummy · Snow Ride','⛄ All-Time Stats','Last stop: a winter wonder-win!']};
 const selectors=['.theme-caption','.logo','.logo-sub','.game-title','.stats-ttl','.win-sub'];
 function resolve(data){return themes[data?.theme_name]?data.theme_name:('classic')}
 function apply(theme){
  current=theme;root.dataset.theme=theme;
  selectors.forEach((selector,i)=>{const el=document.querySelector(selector);if(el)el.textContent=seasonalLabels[theme]?.[i]||el.dataset[theme]||el.dataset.classic});
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme)));
  document.getElementById('theme-status').textContent=themes[theme].name+' edition';
  document.querySelector('meta[name="theme-color"]').content=themes[theme].color;
  const banner=document.querySelector('.seasonal-banner');banner.textContent=theme==='fall'?'🍁 A cozy ride. A friendly rivalry. 🍂':theme==='winter'?'❄️ Warm hands. Cool cards. ☕':'🦇 Deal a little mischief. 🦇';
  document.querySelector('.seasonal-train').textContent=theme==='fall'?'🍂 🚂 🍁 ☕':'❄️ 🚂 ⛄ 🌲';
 }
 window.refreshSharedTheme=async function(){
  if(refreshing||busy)return;refreshing=true;
  try{const {data,error}=await getSupabase().from('app_settings').select('theme_name').single();if(error)throw Error(error.message);if(!busy)apply(resolve(data))}
  catch(e){console.warn('Theme unavailable:',e)}finally{refreshing=false}
 };
 window.selectAdminTheme=async function(theme){
  if(busy||!themes[theme])return;busy=true;
  const buttons=document.querySelectorAll('[data-theme-choice]');const status=document.getElementById('theme-save-status');buttons.forEach(b=>b.disabled=true);status.textContent='Saving…';
  try{
   const {data,error}=await getSupabase().rpc('update_admin_settings',{p_admin_code:adminSessionCode,p_theme_name:theme});
   if(error)throw Error(error.message);if(!data?.length)throw Error('Theme was not saved.');
   apply(resolve(data[0]));status.textContent=themes[current].name+' enabled for everyone.';
  }catch(e){status.textContent=e.message||'Please unlock Admin again.'}finally{busy=false;buttons.forEach(b=>b.disabled=false)}
 };
 apply('classic');document.addEventListener('DOMContentLoaded',()=>refreshSharedTheme(),{once:true});
 setInterval(()=>{if(!document.hidden)refreshSharedTheme()},5000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSharedTheme()});
})();
