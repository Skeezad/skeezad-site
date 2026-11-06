/* Original Skeezad orbital sculpture. All geometry is rendered locally. */
(() => {
  const canvas = document.querySelector('#nexus');
  const context = canvas.getContext('2d');
  const container = canvas.parentElement;
  const toggle = document.querySelector('#motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, dpr = 1;
  let paused = preference.matches, visible = true, frame = 0, previous = 0, time = 0;
  let pointer = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
  let vertices = [], faces = [], stars = [];

  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const norm = a => { const length = Math.hypot(...a); return a.map(v => v / (length || 1)); };
  function path(u) { return [(2 + .58*Math.cos(3*u))*Math.cos(2*u), (2 + .58*Math.cos(3*u))*Math.sin(2*u), .88*Math.sin(3*u)]; }
  function buildGeometry() {
    vertices = []; faces = [];
    const segments = width < 500 ? 105 : 150, sides = width < 500 ? 9 : 12;
    for (let i = 0; i < segments; i++) {
      const u = i / segments * Math.PI * 2, center = path(u), next = path(u + .001);
      const tangent = norm(next.map((v, axis) => v - center[axis]));
      const normal = norm(cross(tangent, [0,0,1])), binormal = norm(cross(tangent, normal));
      for (let j = 0; j < sides; j++) {
        const angle = j / sides * Math.PI * 2;
        vertices.push(center.map((v, axis) => v + .30*(Math.cos(angle)*normal[axis] + Math.sin(angle)*binormal[axis])));
        faces.push([i*sides+j, ((i+1)%segments)*sides+j, ((i+1)%segments)*sides+(j+1)%sides, i*sides+(j+1)%sides]);
      }
    }
    stars = Array.from({ length: 50 }, (_, i) => ({x: (Math.sin(i*127.1)*43758.5453)%1, y: (Math.cos(i*311.7)*15731.789)%1, size: i%5 === 0 ? 1.2 : .5}));
  }
  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    context.setTransform(dpr,0,0,dpr,0,0);
    buildGeometry(); render();
  }
  function rotate(p, ax, ay, az) {
    let [x,y,z] = p;
    [y,z] = [y*Math.cos(ax)-z*Math.sin(ax), y*Math.sin(ax)+z*Math.cos(ax)];
    [x,z] = [x*Math.cos(ay)+z*Math.sin(ay), -x*Math.sin(ay)+z*Math.cos(ay)];
    return [x*Math.cos(az)-y*Math.sin(az), x*Math.sin(az)+y*Math.cos(az), z];
  }
  function project(p) {
    const scale = Math.min(width,height)*.133, perspective = 10/(10-p[2]);
    return [width*.5 + p[0]*scale*perspective, height*.47 + p[1]*scale*perspective, p[2]];
  }
  function render() {
    if (!width || !height) return;
    context.clearRect(0,0,width,height);
    const cx = width*.5, cy = height*.47;
    const glow = context.createRadialGradient(cx,cy,0,cx,cy,width*.48);
    glow.addColorStop(0,'rgba(112,165,245,.07)'); glow.addColorStop(1,'rgba(112,165,245,0)');
    context.fillStyle = glow; context.fillRect(0,0,width,height);
    for (const star of stars) {
      context.fillStyle = 'rgba(183,214,255,.28)';
      context.fillRect((star.x+1)*width*.5,(star.y+1)*height*.5,star.size,star.size);
    }
    const ax = .7+Math.sin(time*.19)*.12+smooth.y*.4, ay = time*.13+smooth.x*.6, az = -.45;
    // Fine orbital paths are separate from the knot, making the sculpture readable.
    for (let ring = 0; ring < 2; ring++) {
      context.beginPath();
      for (let i=0;i<=120;i++) {
        const a=i/120*Math.PI*2;
        const point=project(rotate([3.35*Math.cos(a),3.35*Math.sin(a),0],1.14+ring*.6,.2+ring*.7,-.35));
        if(i===0)context.moveTo(point[0],point[1]);else context.lineTo(point[0],point[1]);
      }
      context.strokeStyle=ring?'rgba(135,179,244,.09)':'rgba(135,179,244,.16)';context.lineWidth=.6;context.stroke();
      const angle=time*.22+ring*Math.PI;
      const satellite=project(rotate([3.35*Math.cos(angle),3.35*Math.sin(angle),0],1.14+ring*.6,.2+ring*.7,-.35));
      context.beginPath();context.arc(satellite[0],satellite[1],2.2,0,Math.PI*2);context.fillStyle='#8ebaff';context.fill();
    }
    const rotated=vertices.map(p=>rotate(p,ax,ay,az));
    const projected=rotated.map(project);
    const sorted=faces.map(face=>({face,depth:face.reduce((z,index)=>z+rotated[index][2],0)/4})).sort((a,b)=>a.depth-b.depth);
    for(const {face,depth} of sorted) {
      const a=rotated[face[0]],b=rotated[face[1]],c=rotated[face[2]];
      const normal=norm(cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i])));
      const light=Math.max(0,normal[0]*-.3+normal[1]*-.55+normal[2]*.8);
      const specular=Math.pow(light,12);
      const brightness=22+light*88+specular*112+(depth+3)*3;
      const r=Math.min(245,brightness*.84),g=Math.min(250,brightness*.97+7),bl=Math.min(255,brightness*1.12+14);
      context.beginPath();face.forEach((index,i)=>{const p=projected[index];i?context.lineTo(p[0],p[1]):context.moveTo(p[0],p[1]);});context.closePath();
      context.fillStyle=`rgb(${r|0},${g|0},${bl|0})`;context.fill();
      context.lineWidth=.35;context.strokeStyle=`rgba(126,177,255,${.045+light*.12})`;context.stroke();
    }
    // A restrained light bloom adds depth without a video texture.
    const bloom=context.createRadialGradient(cx-width*.14,cy-height*.12,0,cx-width*.14,cy-height*.12,width*.22);
    bloom.addColorStop(0,'rgba(201,225,255,.045)');bloom.addColorStop(1,'rgba(201,225,255,0)');
    context.fillStyle=bloom;context.fillRect(0,0,width,height);
  }
  function loop(timestamp) {
    frame=0;
    if(paused||!visible||document.hidden)return;
    if(timestamp-previous>=32){
      const delta=Math.min((timestamp-previous)/1000,.06);previous=timestamp;time+=delta;
      smooth.x+=(pointer.x-smooth.x)*.045;smooth.y+=(pointer.y-smooth.y)*.045;render();
    }
    frame=requestAnimationFrame(loop);
  }
  function resume(){if(!frame&&!paused&&visible&&!document.hidden){previous=performance.now();frame=requestAnimationFrame(loop);}}
  function setPaused(value){paused=value;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Play animation':'Pause animation');toggle.textContent=paused?'▷':'Ⅱ';if(paused){cancelAnimationFrame(frame);frame=0;}else resume();}
  toggle.addEventListener('click',()=>setPaused(!paused));
  window.addEventListener('skeezad:motion',event=>setPaused(event.detail.paused));
  container.addEventListener('pointermove',e=>{const rect=container.getBoundingClientRect();pointer={x:(e.clientX-rect.left)/rect.width-.5,y:(e.clientY-rect.top)/rect.height-.5};document.querySelector('#coord-x').textContent=pointer.x.toFixed(2);document.querySelector('#coord-y').textContent=pointer.y.toFixed(2);});
  container.addEventListener('pointerleave',()=>{pointer={x:0,y:0};});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else resume();},{threshold:0}).observe(container);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
  preference.addEventListener('change',e=>setPaused(e.matches));
  new ResizeObserver(resize).observe(container);setPaused(paused);resize();resume();
})();
