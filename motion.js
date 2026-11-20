/* Nocturne: ravens, moving light and depth, rendered locally. */
(()=>{
 const canvas=document.querySelector('#nexus'),ctx=canvas.getContext('2d');
 const scene=document.querySelector('.cathedral-hero'),preference=matchMedia('(prefers-reduced-motion: reduce)');
 let w=0,h=0,frame=0,previous=0,time=0,visible=true,paused=preference.matches;
 const birds=Array.from({length:7},(_,i)=>({phase:i*.143,y:.2+(i%4)*.055,size:4+(i%3)*2,speed:.018+i*.001}));
 function render(){
  ctx.clearRect(0,0,w,h);
  const light=ctx.createLinearGradient(w*.74,0,w*.35,h);
  light.addColorStop(0,'rgba(195,151,145,.045)');light.addColorStop(.7,'rgba(195,151,145,0)');
  ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(w*.77,0);ctx.lineTo(w*.89,0);ctx.lineTo(w*.54,h);ctx.lineTo(w*.06,h);ctx.closePath();ctx.fill();
  birds.forEach((b,i)=>{
   const x=((b.phase+time*b.speed)%1.4-.2)*w,y=(b.y+Math.sin(time*.23+i)*.027)*h;
   const flap=Math.sin(time*5+i*1.7),size=b.size*(w<760?.65:1);
   ctx.save();ctx.translate(x,y);ctx.rotate(-.08+Math.sin(time*.5+i)*.1);ctx.fillStyle='rgba(8,6,9,.8)';
   ctx.beginPath();ctx.moveTo(0,2);ctx.quadraticCurveTo(-size*.7,-size*(.3+flap),-size*2,-size*(.1+flap));ctx.quadraticCurveTo(-size,2,-1,4);ctx.lineTo(0,7);ctx.lineTo(1,4);ctx.quadraticCurveTo(size,2,size*2,-size*(.1+flap));ctx.quadraticCurveTo(size*.7,-size*(.3+flap),0,2);ctx.fill();ctx.restore();
  });
 }
 function resize(){const r=scene.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);render();}
 function loop(now){frame=0;if(paused||!visible||document.hidden)return;if(now-previous>32){time+=Math.min((now-previous)/1000,.06);previous=now;render();}frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&!paused&&visible&&!document.hidden){previous=performance.now();frame=requestAnimationFrame(loop);}}
 function stop(value){paused=value;if(paused){cancelAnimationFrame(frame);frame=0;}else resume();}
 window.addEventListener('skeezad:motion',e=>stop(e.detail.paused));
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else resume();}).observe(scene);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
 preference.addEventListener('change',e=>stop(e.matches));new ResizeObserver(resize).observe(scene);resize();resume();
})();
