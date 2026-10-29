// Animaciones e interacciones. Recibe (R = contenedor, MODE = 'youtube' | 'file') y devuelve una función de limpieza.
export const LANDING_JS = `let alive=true;const cleanups=[];
const on=(t,e,f,o)=>{t.addEventListener(e,f,o);cleanups.push(()=>t.removeEventListener(e,f,o))};
const raf=f=>{if(alive)requestAnimationFrame(f)};
const W_int=(f,t)=>{const i=setInterval(f,t);cleanups.push(()=>clearInterval(i));return i};
const W_io=(cb,o)=>{const x=new IntersectionObserver(cb,o);cleanups.push(()=>x.disconnect());return x};
const io=W_io(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// rotating word
const ws=['Trading','Disciplina','Precisión','Estrategia'];let wi=0;const wEl=document.getElementById('word');
W_int(()=>{wi=(wi+1)%ws.length;wEl.style.animation='none';wEl.textContent=ws[wi];void wEl.offsetWidth;wEl.style.animation='inv-rise .7s both'},2600);
// greek key ring
(function(){const g=document.getElementById('keyring');g.innerHTML='';const N=40,R=203,ns='http://www.w3.org/2000/svg';
 for(let i=0;i<N;i++){const a=i*360/N;const p=document.createElementNS(ns,'path');
  p.setAttribute('d','M-7 10V-10H7V4H-1V-3H2');p.setAttribute('fill','none');p.setAttribute('stroke','#bae6fd');p.setAttribute('stroke-width','3');p.setAttribute('stroke-linecap','square');
  p.setAttribute('transform',\`rotate(\${a} 250 250) translate(250 \${250-R})\`);g.appendChild(p)}})();
// parallax
const scene=document.getElementById('scene'),rig=document.getElementById('rig');
on(window,'mousemove',e=>{const r=scene.getBoundingClientRect();const c=v=>Math.max(-.5,Math.min(.5,v));const x=c((e.clientX-r.left)/r.width-.5),y=c((e.clientY-r.top)/r.height-.5);
 rig.style.transform=\`rotateY(\${x*14}deg) rotateX(\${-y*8}deg)\`});
// particles orbiting
const cv=document.getElementById('cv'),cx=cv.getContext('2d');let W,H,P=[];
function size(){const d=devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)}
size();on(window,'resize',size);
for(let i=0;i<190;i++){P.push({a:Math.random()*6.28,r:.22+Math.random()*.34,s:(.0008+Math.random()*.0026)*(Math.random()<.5?-1:1),z:Math.random()*2+.6,t:Math.random()*6.28})}
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function draw(){cx.clearRect(0,0,W,H);
 P.forEach(p=>{p.a+=p.s;p.t+=.03;const rx=p.r*W,ry=p.r*H*.82;const x=W/2+Math.cos(p.a)*rx,y=H*.48+Math.sin(p.a)*ry;
  cx.globalAlpha=.35+.45*Math.abs(Math.sin(p.t));cx.fillStyle=p.z>2?'#22d3ee':'#0ea5e9';cx.beginPath();cx.arc(x,y,p.z,0,6.28);cx.fill()});
 if(!reduce)raf(draw)}
draw();
// ticker
const t=['MNQ · NASDAQ','ORDER BLOCKS','LIQUIDEZ','FAIR VALUE GAPS','KILL ZONES','ESTRUCTURA DE MERCADO','SESIÓN DE NUEVA YORK','GESTIÓN DE RIESGO'];
document.getElementById('tick').innerHTML=[...t,...t].map(x=>\`<span>\${x}</span>\`).join('');

// loader
(function(){const L=document.getElementById('loader');let done=false;function go(){if(done)return;done=true;R.classList.add('ready');if(L)L.classList.add('off')}
 if(document.readyState==='complete')setTimeout(go,1300);else on(window,'load',()=>setTimeout(go,1300));setTimeout(go,3500)})();
// burger
(function(){const b=document.getElementById('burger'),d=document.getElementById('drawer');
 b.onclick=()=>{const o=d.classList.toggle('open');b.classList.toggle('open',o);b.setAttribute('aria-expanded',o)};
 d.querySelectorAll('a').forEach(a=>a.onclick=()=>{d.classList.remove('open');b.classList.remove('open')});
 on(window,'resize',()=>{if(innerWidth>860){d.classList.remove('open');b.classList.remove('open')}})})();
// hero flowing candles
(function(){const c=document.getElementById('bg'),x=c.getContext('2d');let W,H,cs=[],off=0;const cw=18;
 function mk(o){const ch=(Math.random()-.46)*H*.06,cl=o+ch;return{o,c:cl,h:Math.max(o,cl)+Math.random()*H*.025,l:Math.min(o,cl)-Math.random()*H*.025}}
 function clamp(v){return Math.min(H*.85,Math.max(H*.25,v))}
 function seed(){cs=[];let p=H*.65;const n=Math.ceil(W/cw)+3;for(let i=0;i<n;i++){const k=mk(p);cs.push(k);p=clamp(k.c)}}
 function sz(){const d=Math.min(devicePixelRatio||1,2);W=c.clientWidth;H=c.clientHeight;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);seed()}
 function frame(){x.clearRect(0,0,W,H);off+=.35;if(off>=cw){off=0;cs.push(mk(clamp(cs[cs.length-1].c)));cs.shift()}
  cs.forEach((k,i)=>{const px=i*cw-off+4,up=k.c<=k.o;x.strokeStyle=up?'rgba(14,165,233,.6)':'rgba(99,102,241,.45)';x.fillStyle=up?'rgba(56,189,248,.35)':'rgba(129,140,248,.28)';x.lineWidth=1.5;x.beginPath();x.moveTo(px+cw/2-3,k.h);x.lineTo(px+cw/2-3,k.l);x.stroke();x.fillRect(px,Math.min(k.o,k.c),cw-6,Math.max(3,Math.abs(k.c-k.o)))});
  if(!reduce)raf(frame)}
 sz();let rt;on(window,'resize',()=>{clearTimeout(rt);rt=setTimeout(sz,150)});frame()})();
// spotlight + magnetic
(function(){if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const sp=document.getElementById('spot');
 on(window,'mousemove',e=>{sp.style.transform=\`translate(\${e.clientX}px,\${e.clientY}px)\`});
 document.querySelectorAll('.btn').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=\`translate(\${(e.clientX-r.left-r.width/2)*.18}px,\${(e.clientY-r.top-r.height/2)*.28}px) scale(1.04)\`});b.addEventListener('mouseleave',()=>b.style.transform='')})})();
// big text parallax
(function(){const big=document.getElementById('big');if(!big)return;on(window,'scroll',()=>{big.style.transform=\`translateY(\${Math.min(scrollY,900)*.18}px)\`},{passive:true})})();
// market chart
(function(){const svg=document.getElementById('mk'),ns='http://www.w3.org/2000/svg';
 const D=[[50,54,56,48],[54,52,57,50],[52,56,58,51],[56,53,58,52],[53,55,57,51],[55,52,56,50],[52,50,53,48],[50,51,53,48.5],[51,49,52,48],[49,47,50,44],[47,53,54,46.5],[53,60,61,52.5],[60,66,67,59],[66,64,68,63],[64,67,69,63],[67,63,68,62],[63,60,64,58],[60,59,62,57],[59,62,63,54.5],[62,68,69,61],[68,73,74,67],[73,71,75,70],[71,77,78,70],[77,82,83,76]];
 const X=i=>34+i*25,Y=p=>300-(p-43)*6.9;
 function el(t,a,par){const e=document.createElementNS(ns,t);for(const k in a)e.setAttribute(k,a[k]);(par||svg).appendChild(e);return e}
 function build(){svg.innerHTML='';
  for(let i=0;i<5;i++)el('line',{x1:0,x2:640,y1:25+i*65,y2:25+i*65,stroke:'#e0f2fe','stroke-width':1});
  const zs={};
  zs.ob=el('g',{class:'z'});el('rect',{x:X(8)-9,y:Y(52),width:X(19)-X(8)+4,height:Y(48)-Y(52),fill:'rgba(14,165,233,.22)',stroke:'#0ea5e9','stroke-width':1.5,rx:4},zs.ob);el('text',{x:X(11),y:Y(48)+22,class:'cl',fill:'#0284c7'},zs.ob).textContent='OB';
  zs.fvg=el('g',{class:'z'});el('rect',{x:X(11)-9,y:Y(59),width:X(19)-X(11)+4,height:Y(54)-Y(59),fill:'rgba(99,102,241,.2)',stroke:'#6366f1','stroke-width':1.5,rx:4},zs.fvg);el('text',{x:X(13),y:Y(54)-6,class:'cl',fill:'#4f46e5'},zs.fvg).textContent='FVG';
  zs.liq=el('g',{class:'z'});el('line',{x1:X(0)-8,x2:X(9)+14,y1:Y(48),y2:Y(48),stroke:'#0284c7','stroke-width':2,'stroke-dasharray':'6 6'},zs.liq);el('text',{x:X(0)-6,y:Y(48)+24,class:'cl',fill:'#0284c7'},zs.liq).textContent='LIQ';
  zs.sweep=el('g',{class:'pop'});el('circle',{cx:X(9),cy:Y(44),r:11,fill:'none',stroke:'#0ea5e9','stroke-width':3},zs.sweep);el('circle',{cx:X(9),cy:Y(44),r:4,fill:'#0ea5e9'},zs.sweep);
  const cg=el('g');const cds=[];
  D.forEach(([o,c,h,l],i)=>{const g=el('g',{class:'cd'},cg),up=c>=o,col=up?'#0ea5e9':'#6366f1';
   el('line',{x1:X(i)+5,x2:X(i)+5,y1:Y(h),y2:Y(l),stroke:col,'stroke-width':2,'stroke-linecap':'round'},g);
   el('rect',{x:X(i),y:Y(Math.max(o,c)),width:10,height:Math.max(3,Math.abs(Y(o)-Y(c))),rx:2,fill:up?'url(#cu)':'url(#cdn)',stroke:col,'stroke-width':1},g);cds.push(g)});
  const defs=el('defs',{},svg);svg.insertBefore(defs,svg.firstChild);
  defs.innerHTML='<linearGradient id="cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient><linearGradient id="cdn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5b4fc"/><stop offset="1" stop-color="#6366f1"/></linearGradient>';
  zs.sl=el('g',{class:'z'});el('line',{x1:X(18)-6,x2:X(23)+22,y1:Y(46.5),y2:Y(46.5),stroke:'#6366f1','stroke-width':2,'stroke-dasharray':'5 5'},zs.sl);el('text',{x:X(23)+4,y:Y(46.5)+22,class:'cl',fill:'#4f46e5'},zs.sl).textContent='SL';
  zs.tp=el('g',{class:'z'});el('line',{x1:X(18)-6,x2:X(23)+22,y1:Y(84),y2:Y(84),stroke:'#0ea5e9','stroke-width':2,'stroke-dasharray':'5 5'},zs.tp);el('text',{x:X(23)+4,y:Y(84)+22,class:'cl',fill:'#0284c7'},zs.tp).textContent='TP';
  zs.en=el('g',{class:'pop'});el('circle',{cx:X(18)+5,cy:Y(58),r:13,fill:'#fff',stroke:'#0ea5e9','stroke-width':3},zs.en);el('path',{d:\`M\${X(18)+5} \${Y(58)+6}V\${Y(58)-6}M\${X(18)+5-5} \${Y(58)-1}L\${X(18)+5} \${Y(58)-7}L\${X(18)+10} \${Y(58)-1}\`,stroke:'#0ea5e9','stroke-width':3,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},zs.en);el('text',{x:X(19)+14,y:Y(52.5),class:'cl',fill:'#0284c7'},zs.en).textContent='ENTRADA';
  return{cds,zs}}
 let T=[],M;const lis=[...document.querySelectorAll('#legend li')];
 function step(n){lis.forEach(l=>l.classList.toggle('on',+l.dataset.s<=n&&+l.dataset.s>=n))}
 function run(){T.forEach(clearTimeout);T=[];M=build();step(0);
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){M.cds.forEach(c=>c.classList.add('on'));Object.values(M.zs).forEach(z=>z.classList.add('on'));step(4);return}
  M.cds.forEach((c,i)=>T.push(setTimeout(()=>c.classList.add('on'),120+i*60)));
  const t0=120+D.length*60+300;
  T.push(setTimeout(()=>{M.zs.liq.classList.add('on');M.zs.sweep.classList.add('on');step(1)},t0));
  T.push(setTimeout(()=>{M.zs.ob.classList.add('on');step(2)},t0+1300));
  T.push(setTimeout(()=>{M.zs.fvg.classList.add('on');step(3)},t0+2600));
  T.push(setTimeout(()=>{M.zs.en.classList.add('on');M.zs.sl.classList.add('on');M.zs.tp.classList.add('on');step(4)},t0+3900))}
 let started=false;W_io((es,o)=>{if(es[0].isIntersecting&&!started){started=true;run();o.disconnect()}},{threshold:.35}).observe(svg);
 document.getElementById('replay').onclick=run})();
// video
(function(){const v=document.getElementById('vid');if(!v)return;
 function play(){if(v.classList.contains('playing'))return;v.classList.add('playing');v.removeAttribute('role');v.removeAttribute('tabindex');
  v.innerHTML=MODE==='file'
   ?'<video src="/landing/video.mp4" poster="/landing/poster.jpg" controls autoplay playsinline controlsList="nodownload" title="Si estas empezando en el trading, mira este video"></video>'
   :'<iframe src="https://www.youtube.com/embed/H-t8Sk2FhA0?autoplay=1&rel=0&playsinline=1" title="Si estas empezando en el trading, mira este video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'}
 v.addEventListener('click',play);v.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play()}})})();
// faq
const f=[['¿Cómo obtengo acceso?','Crea tu cuenta y espera la aprobación del equipo. Cuando tu solicitud sea aprobada podrás iniciar sesión y ver el contenido de tu nivel.'],['¿Qué diferencia hay entre CLUB y MENTORÍA?','CLUB da acceso al contenido del club. MENTORÍA incluye todo lo de CLUB y suma el contenido exclusivo del programa de mentoría.'],['¿Las clases quedan grabadas?','Sí. Las clases y grabaciones están disponibles en la plataforma para verlas cuando quieras.'],['¿En qué activo se enfoca el contenido?','En el Micro Nasdaq (MNQ), operado con la metodología ICT y ejecución institucional.']];
const fa=document.getElementById('faqs');fa.innerHTML='';
f.forEach(([q,a],i)=>{const d=document.createElement('div');d.className='q'+(i==0?' open':'');
 d.innerHTML=\`<button>\${q}</button><div class="a"><div><p>\${a}</p></div></div>\`;
 d.querySelector('button').onclick=()=>{const o=d.classList.contains('open');fa.querySelectorAll('.q').forEach(x=>x.classList.remove('open'));if(!o)d.classList.add('open')};fa.appendChild(d)});
// scroll fx
const bar=document.getElementById('bar'),win=document.getElementById('win'),links=[...document.querySelectorAll('.links a')];
function onS(){const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:0)+'%';
 const r=win.getBoundingClientRect();const p=Math.min(1,Math.max(0,1-r.top/(innerHeight*.95)));
 win.style.transform=\`perspective(1400px) rotateX(\${(1-p)*18}deg) scale(\${.92+p*.08}) translateY(\${(1-p)*30}px)\`;
 let cur='top';['metodo','plataforma','planes','faq'].forEach(id=>{const e=document.getElementById(id);if(e&&e.getBoundingClientRect().top<innerHeight*.5)cur=id});
 links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur))}
on(window,'scroll',onS,{passive:true});onS();
document.querySelectorAll('.gl').forEach(g=>g.addEventListener('mousemove',e=>{const r=g.getBoundingClientRect();g.style.setProperty('--mx',e.clientX-r.left+'px');g.style.setProperty('--my',e.clientY-r.top+'px')}));
return ()=>{alive=false;cleanups.forEach(f=>f())};
`