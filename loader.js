/* A bounded loading screen. No media downloads or recurring animation. */
(()=>{
 const overlay=document.getElementById('site-loader');if(!overlay)return;
 const bar=document.getElementById('loader-progress'),percent=document.getElementById('loader-percent'),stage=document.getElementById('loader-stage');
 const regions=[...document.querySelectorAll('header,main,footer')];
 document.body.classList.add('is-loading');regions.forEach(el=>el.inert=true);
 let finished=false;const began=performance.now();
 function progress(value,label){bar.style.width=value+'%';percent.textContent=String(value).padStart(2,'0');stage.textContent=label;}
 function finish(){if(finished)return;finished=true;clearTimeout(deadline);clearTimeout(step);progress(100,'READY');overlay.hidden=true;regions.forEach(el=>el.inert=false);document.body.classList.remove('is-loading');}
 const step=setTimeout(()=>{if(!finished)progress(55,'PREPARING THE TYPE');},150);
 const deadline=setTimeout(finish,1800);
 const fonts=document.fonts?.ready||Promise.resolve();
 fonts.then(()=>{const wait=Math.max(0,550-(performance.now()-began));setTimeout(finish,wait);}).catch(finish);
 window.addEventListener('pageshow',event=>{if(event.persisted)finish();});
 progress(12,'OPENING THE SANCTUARY');
})();
