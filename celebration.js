(function(){
 let cleanup=null;
 const particles={fall:['🍁','🍂','🍃'],winter:['❄️','❅','❆'],halloween:['🎃','👻','🕷️']};
 window.playThemedCelebration=function(theme){
  if(cleanup)cleanup();
  const symbols=particles[theme];if(!symbols)return false;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layer=document.createElement('div');layer.className='celebration-layer celebration-'+theme+(reduced?' celebration-still':'');layer.setAttribute('aria-hidden','true');
  const count=reduced?10:(theme==='winter'?54:42);
  for(let i=0;i<count;i++){
   const item=document.createElement('span');item.className='celebration-particle';item.textContent=symbols[i%symbols.length];
   item.style.setProperty('--x',((i+Math.random())/count*100)+'vw');
   item.style.setProperty('--drift',(Math.random()*140-70)+'px');
   item.style.setProperty('--angle',(Math.random()*80-40)+'deg');
   item.style.setProperty('--spin',(theme==='winter'?Math.random()*120-60:Math.random()*540-270)+'deg');
   item.style.setProperty('--duration',((theme==='winter'?5:3.5)+Math.random()*1.5)+'s');
   item.style.setProperty('--delay',(Math.random()*1.2)+'s');
   item.style.setProperty('--size',((theme==='winter'?18:22)+Math.random()*12)+'px');
   if(reduced){item.style.left=i%2?'auto':'8px';item.style.right=i%2?'8px':'auto';item.style.top=(12+Math.floor(i/2)*16)+'%'}
   layer.append(item);
  }
  document.body.append(layer);
  const remove=()=>{clearTimeout(timer);layer.remove();document.removeEventListener('visibilitychange',onHidden);if(cleanup===remove)cleanup=null};
  const onHidden=()=>{if(document.hidden)remove()};
  const timer=setTimeout(remove,reduced?1600:8000);cleanup=remove;
  document.addEventListener('visibilitychange',onHidden);
  return true;
 };
})();
