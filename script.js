const $ = s => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const started=Date.now();
document.body.classList.add('js-ready');
const nav=$('#navigation'),menu=$('.menu-toggle');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveals.unobserve(e.target);}}),{threshold:.07});
document.querySelectorAll('.reveal').forEach(el=>reveals.observe(el));
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}),{rootMargin:'-20% 0px -50% 0px'});
document.querySelectorAll('#about,#expertise,#lab').forEach(el=>sectionObserver.observe(el));
window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#reading-progress').style.width=(max>0?scrollY/max*100:0)+'%';},{passive:true});
function updateClock(){const time=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:'Asia/Tehran'}).format(new Date());$('#local-clock').textContent=time+' / TEHRAN';const seconds=Math.floor((Date.now()-started)/1000);$('#uptime').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}updateClock();setInterval(updateClock,1000);
const terminalHome=$('#terminal').parentElement;
function setTerminalFullscreen(expand){const terminal=$('#terminal');terminal.classList.toggle('fullscreen',expand);if(expand)document.body.append(terminal);else terminalHome.append(terminal);}
$('#expand-terminal').addEventListener('click',()=>setTerminalFullscreen(!$('#terminal').classList.contains('fullscreen')));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setTerminalFullscreen(false);nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}});
const terminalLog=$('#terminal-log'),terminalInput=$('#terminal-input'),history=[];let historyIndex=0;
function print(text,className=''){const p=document.createElement('p');p.textContent=text;p.className=className;terminalLog.append(p);while(terminalLog.children.length>160)terminalLog.firstChild.remove();terminalLog.scrollTop=terminalLog.scrollHeight;}
const commandNames=['help','whoami','skills','contact','date','pwd','ls','cat','clear','echo','encode','decode','hash','uptime','fortune','expand','collapse'];
async function runCommand(raw){const [cmd,...args]=raw.trim().split(/\s+/);const text=args.join(' ');switch(cmd.toLowerCase()){
case 'help':print('A FEW THINGS TO TRY\n\n'+commandNames.join(' · ')+'\n\nhash <text>    → SHA-256 fingerprint\nencode <text>  → Base64 encode\ndecode <text>  → Base64 decode\ncat about.txt  → A little context\nfortune        → A thought for the road\n\n↑ ↓ recall commands. Tab completes.');break;
case 'whoami':print('A curious human. Welcome to Skeezad’s corner.');break;
case 'skills':print('OSINT / security / reverse engineering / code / AI');break;
case 'contact':print('Telegram: https://t.me/TheSkeezad\nChannel: https://t.me/Skeezad\nEmail: Amir@Skeezad.site');break;
case 'date':print(new Date().toLocaleString('en-GB',{timeZone:'Asia/Tehran'})+' / Tehran');break;
case 'pwd':print('/home/skeezad/playground');break;
case 'ls':print('about.txt  interests.txt  contact.txt');break;
case 'cat':print({'about.txt':'Skeezad — exploring security, code, and the connections between things.','interests.txt':'OSINT · SECURITY · CODE · AI','contact.txt':'Telegram: @TheSkeezad\nChannel: @Skeezad\nEmail: Amir@Skeezad.site'}[text]||'No such file. Try ls.');break;
case 'clear':terminalLog.replaceChildren();break;
case 'echo':print(text);break;
case 'encode':case 'encrypt':print(btoa(String.fromCharCode(...new TextEncoder().encode(text))));break;
case 'decode':case 'decrypt':try{print(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(text),c=>c.charCodeAt(0))));}catch{print('That does not look like valid Base64.');}break;
case 'hash':if(!crypto.subtle){print('Open this page on localhost or HTTPS to use SHA-256.');break;}print([...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join(''));break;
case 'uptime':print(Math.floor((Date.now()-started)/1000)+' seconds of curiosity.');break;
case 'fortune':print(['The most useful question is often the one nobody asked.','Small tools. Good questions. Unexpected connections.','Curiosity is a direction, not a destination.','Look closer. There is probably a story there.','Build something, learn something, repeat.'][Math.random()*5|0]);break;
case 'expand':setTerminalFullscreen(true);break;
case 'collapse':setTerminalFullscreen(false);break;
default:print('Unknown command. Try help — it is a good place to start.');}}
async function submitCommand(raw){if(!raw)return;history.push(raw);historyIndex=history.length;print('skeezad ~ → '+raw,'command-line');try{await runCommand(raw);}catch{print('Something went wrong. Try another command.');}terminalLog.scrollTop=terminalLog.scrollHeight;}
$('#terminal-form').addEventListener('submit',async e=>{e.preventDefault();const raw=terminalInput.value.trim();terminalInput.value='';await submitCommand(raw);});
terminalInput.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();historyIndex=Math.max(0,historyIndex-1);terminalInput.value=history[historyIndex]||'';}if(e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);terminalInput.value=history[historyIndex]||'';}if(e.key==='Tab'){e.preventDefault();const name=commandNames.find(n=>n.startsWith(terminalInput.value));if(name)terminalInput.value=name;}});
document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>{submitCommand(button.dataset.command);if(innerWidth<768)$('#terminal').scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});}));
