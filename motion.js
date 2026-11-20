/* Skeezad: drifting embers inside the cathedral window. */
(() => {
 const canvas=document.querySelector('#nexus'),ctx=canvas.getContext('2d');
 const container=canvas.parentElement,toggle=document.querySelector('#motion-toggle');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let w=0,h=0,frame=0,previous=0,time=0,visible=true,paused=preference.matches;
 let pointer={x:0,y:0},smooth={x:0,y:0};
 const embers=Array.from({length:42},(_,i)=>({x:((i*137.508)%100)/100,y:((i*73.17)%100)/100,size:i%7===0?1.4:.65,speed:.009+(i%5)*.003,phase:i*2.39}));
 function render(){
  ctx.clearRect(0,0,w,h);
  embers.forEach(p=>{
   const y=1-((p.y+time*p.speed)%1),x=p.x+Math.sin(time*.15+p.phase)*.035+smooth.x*.025;
   const alpha=Math.sin(y*Math.PI)*(.2+(Math.sin(time*.6+p.phase)+1)*.17);
   ctx.fillStyle=`rgba(205,149,165,${alpha})`;
   ctx.beginPath();ctx.arc(w*(.12+x*.76),h*(.08+y*.78),p.size,0,Math.PI*2);ctx.fill();
  });
 }
 function resize(){const r=container.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);render();}
 function loop(now){frame=0;if(paused||!visible||document.hidden)return;if(now-previous>32){time+=Math.min((now-previous)/1000,.06);previous=now;smooth.x+=(pointer.x-smooth.x)*.03;smooth.y+=(pointer.y-smooth.y)*.03;render();}frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&!paused&&visible&&!document.hidden){previous=performance.now();frame=requestAnimationFrame(loop);}}
 function setPaused(value){paused=value;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Play animation':'Pause animation');toggle.textContent=paused?'▷':'Ⅱ';document.querySelector('.cathedral').style.animationPlayState=paused?'paused':'running';document.querySelector('.blood-moon').style.animationPlayState=paused?'paused':'running';if(paused){cancelAnimationFrame(frame);frame=0;}else resume();}
 toggle.addEventListener('click',()=>setPaused(!paused));
 window.addEventListener('skeezad:motion',e=>setPaused(e.detail.paused));
 container.addEventListener('pointermove',e=>{const r=container.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};document.querySelector('#coord-x').textContent=pointer.x.toFixed(2);document.querySelector('#coord-y').textContent=pointer.y.toFixed(2);});
 container.addEventListener('pointerleave',()=>pointer={x:0,y:0});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else resume();}).observe(container);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
 preference.addEventListener('change',e=>setPaused(e.matches));
 new ResizeObserver(resize).observe(container);resize();setPaused(paused);
})();
