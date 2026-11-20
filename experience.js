/* One shared motion preference for cinema, atmosphere and interface. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const videos=[...document.querySelectorAll('[data-auto-video]')];
 const ambient=document.querySelector('#ambient-toggle'),toggle=document.querySelector('#motion-toggle');
 let paused=preference.matches;
 function update(){
  const stop=paused||document.hidden;
  videos.forEach(video=>{if(!stop&&video.dataset.visible==='true'){video.muted=true;video.play().catch(()=>{});}else video.pause();});
  document.body.classList.toggle('motion-paused',stop);
  ambient.setAttribute('aria-pressed',String(paused));ambient.textContent=paused?'RESUME THE SCENE':'PAUSE THE SCENE';
  toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume scene animation':'Pause scene animation');toggle.textContent=paused?'\u25b7':'\u2161';
  window.dispatchEvent(new CustomEvent('skeezad:motion',{detail:{paused:stop}}));
 }
 function flip(){paused=!paused;update();}
 ambient.addEventListener('click',flip);toggle.addEventListener('click',flip);
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.target.dataset.visible=String(e.isIntersecting));update();},{threshold:.03});videos.forEach(v=>observer.observe(v));
 preference.addEventListener('change',e=>{paused=e.matches;update();});document.addEventListener('visibilitychange',update);
 const scene=document.querySelector('.cathedral-hero');
 if(matchMedia('(pointer:fine)').matches){
  scene.addEventListener('pointermove',e=>{if(paused)return;const r=scene.getBoundingClientRect();scene.style.setProperty('--scene-x',((e.clientX-r.left)/r.width-.5)*-10+'px');scene.style.setProperty('--scene-y',((e.clientY-r.top)/r.height-.5)*-6+'px');},{passive:true});
  scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--scene-x','0px');scene.style.setProperty('--scene-y','0px');});
 }
 update();
})();
