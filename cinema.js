/* New monochrome studies. Visibility and OS motion preference control playback. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const films=[...document.querySelectorAll('[data-cinema]')];
 function playback(){const stop=preference.matches||document.hidden;films.forEach(f=>{if(!stop&&f.dataset.visible==='true'){f.muted=true;f.play().catch(()=>{});}else f.pause();});document.body.classList.toggle('tab-hidden',document.hidden);}
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.target.dataset.visible=String(e.isIntersecting));playback();},{threshold:.04});films.forEach(f=>observer.observe(f));
 preference.addEventListener('change',playback);document.addEventListener('visibilitychange',playback);
 const reveals=[...document.querySelectorAll('.identity-card,.about-copy,.section-heading,.expertise-card,.lab-copy,.terminal,.contact-main,.contact-links')];
 reveals.forEach(el=>el.classList.add('scroll-reveal'));
 document.querySelectorAll('.expertise-card').forEach((el,i)=>el.style.setProperty('--arrival',i%2*90+'ms'));
 document.body.classList.add('motion-ready');
 const appearance=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');appearance.unobserve(e.target);}}),{threshold:.06});reveals.forEach(el=>appearance.observe(el));
 const art=document.querySelector('.hero-engraving');let pointerFrame=0;
 if(matchMedia('(pointer:fine)').matches){art.addEventListener('pointermove',e=>{if(pointerFrame||preference.matches)return;pointerFrame=requestAnimationFrame(()=>{const r=art.getBoundingClientRect();art.style.setProperty('--light-x',(e.clientX-r.left)/r.width*100+'%');art.style.setProperty('--light-y',(e.clientY-r.top)/r.height*100+'%');pointerFrame=0;});},{passive:true});}
 playback();
})();
