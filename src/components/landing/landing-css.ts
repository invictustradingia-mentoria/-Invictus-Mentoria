// Estilos de la landing (aislados con la clase .invl)
export const LANDING_CSS = `.invl *{box-sizing:border-box;margin:0;padding:0}
.invl{scroll-behavior:smooth}
.invl{--b1:#0ea5e9;--b2:#0284c7;--b3:#0c4a6e;--s:#e0f2fe;--ink:#0b1b2e}
.invl{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#fff;color:var(--ink);overflow-x:clip;-webkit-font-smoothing:antialiased}
.invl a{text-decoration:none;color:inherit}
.invl .wrap{max-width:1240px;margin:0 auto;padding:0 28px}
.invl .grad{background:linear-gradient(100deg,#0369a1,#0ea5e9 45%,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}
.invl .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;font-weight:800;font-size:14px;letter-spacing:.04em;text-transform:uppercase;padding:18px 34px;transition:transform .25s,box-shadow .25s;position:relative;overflow:hidden;cursor:pointer;border:0}
.invl .btn:hover{transform:translateY(-3px) scale(1.03)}
.invl .blue{background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;box-shadow:0 18px 40px -12px rgba(2,132,199,.7),inset 0 1px 0 rgba(255,255,255,.5)}
.invl .blue:after{content:'';position:absolute;inset:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);animation:inv-shine 3s ease-in-out infinite}
.invl .ghost{background:rgba(255,255,255,.7);border:1.5px solid #7dd3fc;color:#0369a1;backdrop-filter:blur(8px)}
@keyframes inv-shine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(280%) skewX(-20deg)}}
@keyframes inv-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes inv-slab{0%,100%{translate:0 0}50%{translate:0 -18px}}
@keyframes inv-spin{to{transform:rotate(360deg)}}
@keyframes inv-candle{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.6)}}
@keyframes inv-pulse{0%{box-shadow:0 0 0 0 rgba(14,165,233,.55)}100%{box-shadow:0 0 0 14px rgba(14,165,233,0)}}
@keyframes inv-rise{from{opacity:0;transform:translateY(46px) skewY(2deg)}to{opacity:1;transform:none}}
@keyframes inv-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
@keyframes inv-eye{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes inv-steam{0%{opacity:0;transform:translate(0,0) scale(.5)}30%{opacity:.8}100%{opacity:0;transform:translate(var(--dx),40px) scale(1.6)}}
@keyframes inv-haloP{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
@keyframes inv-twinkle{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35) drop-shadow(0 0 8px #fff)}}
@keyframes inv-spark{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(45deg)}}
@keyframes inv-arrUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes inv-arrDown{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
@keyframes inv-gridMove{to{background-position:0 60px}}
@keyframes inv-marquee{to{transform:translateX(-50%)}}
@keyframes inv-draw{to{stroke-dashoffset:0}}
.invl .reveal{opacity:0;transform:translateY(34px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}
.invl .reveal.in{opacity:1;transform:none}
.invl #bar{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#38bdf8,#22d3ee);z-index:200;width:0}
.invl header{position:fixed;top:14px;left:0;right:0;z-index:100;padding:0 16px}
.invl .glassbar{background:rgba(255,255,255,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(186,230,253,.95);box-shadow:0 12px 44px -14px rgba(2,132,199,.35)}
.invl .nav{max-width:1180px;margin:0 auto;height:60px;border-radius:999px;display:flex;align-items:center;justify-content:space-between;padding:0 10px 0 18px}
.invl .logo{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:.06em;font-size:14px}
.invl .logo svg{width:34px;height:34px}
.invl .logo b{color:var(--b1)}
.invl .links{display:flex;gap:2px;background:rgba(224,242,254,.7);padding:4px;border-radius:999px}
.invl .links a{padding:9px 18px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#475569;transition:.2s}
.invl .links a.on{background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;box-shadow:0 6px 16px -6px rgba(2,132,199,.7)}
.invl .links a:hover:not(.on){color:var(--b1)}
.invl .nav .btn{padding:12px 24px;font-size:11px}
@media(max-width:860px){.invl .links{display:none}}
.invl .hero{position:relative;overflow:hidden;min-height:100vh;padding:120px 0 60px;background:radial-gradient(ellipse at 72% 45%,#bae6fd 0%,#e0f2fe 32%,#fff 70%)}
.invl .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(2,132,199,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(2,132,199,.09) 1px,transparent 1px);background-size:60px 60px;animation:inv-gridMove 8s linear infinite;-webkit-mask-image:radial-gradient(ellipse at 60% 50%,#000 20%,transparent 70%);mask-image:radial-gradient(ellipse at 60% 50%,#000 20%,transparent 70%)}
.invl .bigtxt{position:absolute;right:-2%;top:12%;font-size:clamp(160px,26vw,380px);font-weight:900;letter-spacing:-.05em;color:transparent;-webkit-text-stroke:2px rgba(14,165,233,.18);line-height:.8;pointer-events:none;user-select:none}
.invl .hero .cols{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:10px;align-items:center;min-height:calc(100vh - 180px)}
@media(max-width:960px){.invl .hero .cols{grid-template-columns:1fr}}
.invl h1{font-size:clamp(34px,4.6vw,66px);line-height:.98;font-weight:900;letter-spacing:-.035em;text-transform:uppercase;color:var(--ink)}
.invl h1 .l{display:block;padding-bottom:.06em;white-space:nowrap}
.invl h1 .l span{display:inline-block;opacity:0;animation:inv-rise .95s cubic-bezier(.2,.7,.2,1) forwards}
.invl h1 .l:nth-child(2){padding-left:9%}
.invl h1 .l:nth-child(3){padding-left:3%}
.invl .sub{margin-top:26px;max-width:470px;color:#43556b;line-height:1.7;font-size:15px}
.invl .cta{margin-top:34px;display:flex;gap:14px;flex-wrap:wrap;align-items:center}
.invl .cards{display:flex;gap:16px;margin-top:44px;flex-wrap:wrap}
.invl .card{background:rgba(255,255,255,.7);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.95);border-radius:28px;padding:18px 22px;box-shadow:0 24px 50px -20px rgba(2,132,199,.5),inset 0 0 0 1px rgba(125,211,252,.4)}
.invl .card b{display:block;font-size:30px;font-weight:900;letter-spacing:-.02em}
.invl .card small{font-size:11px;font-weight:700;color:#64748b;letter-spacing:.04em}
.invl .card.live{display:flex;align-items:center;gap:12px;font-size:12px;font-weight:800;color:#0369a1}
.invl .dot{width:10px;height:10px;border-radius:50%;background:#10b981;animation:inv-pulse 1.8s infinite}
.invl .scene{position:relative;height:min(78vh,700px);min-height:520px;width:100%;perspective:1400px}
.invl .scene canvas{position:absolute;inset:-6%;width:112%;height:112%;pointer-events:none}
.invl .glow{position:absolute;left:50%;top:48%;width:70%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.65),rgba(125,211,252,.25) 45%,transparent 70%);filter:blur(24px)}
.invl .ring{position:absolute;left:50%;top:48%;border-radius:50%;border:1.5px dashed rgba(2,132,199,.35)}
.invl .ring i{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px;border-radius:50%;background:#0ea5e9;box-shadow:0 0 16px 4px rgba(14,165,233,.7)}
.invl .rig{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .25s ease-out}
.invl .slabs{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}
.invl .sl{position:absolute;width:150px;height:400px;margin:-250px 0 0 -75px;border-radius:26px;background:linear-gradient(160deg,rgba(255,255,255,.85),rgba(186,230,253,.55) 45%,rgba(165,243,252,.7));border:1px solid rgba(255,255,255,.95);box-shadow:0 40px 80px -20px rgba(2,132,199,.55),inset 0 0 40px rgba(255,255,255,.8);display:flex;align-items:flex-end;justify-content:space-around;padding:0 18px 30px;overflow:hidden}
.invl .sl i{width:13px;border-radius:99px;transform-origin:bottom;animation:inv-candle 3.2s ease-in-out infinite}
.invl .bullw{position:absolute;left:50%;bottom:-2%;width:min(86%,520px);transform:translateX(-50%) translateZ(60px)}
.invl .bull{width:100%;display:block;filter:drop-shadow(0 30px 40px rgba(2,60,110,.35));animation:inv-breathe 5s ease-in-out infinite;transform-origin:50% 100%}
.invl .eye{transform-box:fill-box;transform-origin:center;animation:inv-eye 5s infinite}
.invl .fc{position:absolute;display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:20px;font-size:12px;font-weight:800;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);border:1px solid rgba(186,230,253,.95);box-shadow:0 20px 44px -16px rgba(2,132,199,.5);color:#0c4a6e;z-index:5}
.invl .soc{position:absolute;right:-4px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px;z-index:6}
.invl .soc a{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.85);border:1px solid #bae6fd;color:#0284c7;box-shadow:0 12px 26px -10px rgba(2,132,199,.5);transition:.25s}
.invl .soc a:hover{background:#0ea5e9;color:#fff;transform:scale(1.12)}
.invl .soc svg{width:20px;height:20px;fill:currentColor}
@media(max-width:960px){.invl .soc{display:none}
.invl .scene{min-height:460px}
.invl .bigtxt{display:none}
.invl h1 .l:nth-child(n){padding-left:0}}
.invl .prev{position:relative;max-width:1060px;margin:-30px auto 0;padding:0 24px 90px;z-index:3}
.invl .win{border-radius:30px;background:#fff;border:1px solid #bae6fd;box-shadow:0 50px 100px -30px rgba(2,132,199,.55);overflow:hidden;will-change:transform}
.invl .tb{display:flex;align-items:center;gap:8px;padding:13px 18px;background:linear-gradient(#f0f9ff,#e0f2fe);border-bottom:1px solid #bae6fd}
.invl .tb i{width:11px;height:11px;border-radius:50%}
.invl .tb em{margin-left:10px;background:#fff;border-radius:99px;padding:4px 14px;font-size:10px;font-weight:700;color:#94a3b8;font-style:normal}
.invl .pb{display:grid;grid-template-columns:210px 1fr}
@media(max-width:700px){.invl .pb{grid-template-columns:1fr}
.invl .side{display:none}}
.invl .side{padding:18px;border-right:1px solid #e0f2fe;background:#f8fcff}
.invl .mem{background:linear-gradient(135deg,#0ea5e9,#22d3ee);color:#fff;border-radius:16px;padding:14px}
.invl .mem small{font-size:10px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;opacity:.85}
.invl .mem p{font-weight:900;font-size:15px;margin-top:2px}
.invl .side .i{margin-top:8px;padding:10px 12px;border-radius:12px;font-size:12px;font-weight:700;color:#94a3b8}
.invl .side .a{background:#e0f2fe;color:#0369a1}
.invl .pm{padding:22px}
.invl .prog{margin-top:18px;font-size:11px;font-weight:900;color:#475569;display:flex;justify-content:space-between}
.invl .track{height:9px;border-radius:99px;background:#e0f2fe;margin-top:7px;overflow:hidden}
.invl .track div{height:100%;border-radius:99px;background:linear-gradient(90deg,#0ea5e9,#22d3ee)}
.invl .mods{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}
.invl .mods div{border:1px solid #e0f2fe;border-radius:14px;padding:12px;font-size:10px;font-weight:700;color:#64748b;line-height:1.8}
.invl .mods h6{font-size:11px;font-weight:900;color:#0c4a6e}
.invl .ok{color:#10b981}
.invl .no{color:#cbd5e1}
.invl .vid{position:relative;aspect-ratio:16/9;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,#bae6fd,#fff,#a5f3fc);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 20px 40px -20px rgba(2,132,199,.5)}
.invl .vid img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s}
.invl .vid:hover img{transform:scale(1.04)}
.invl .vid:after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(12,74,110,.45),rgba(12,74,110,.05) 60%);pointer-events:none}
.invl .vid b{position:relative;z-index:2;width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;padding-left:5px;box-shadow:0 14px 30px rgba(2,132,199,.6);animation:inv-pulse 2s infinite;transition:transform .25s}
.invl .vid:hover b{transform:scale(1.12)}
.invl .vid.playing{cursor:default}
.invl .vid.playing:after{display:none}
.invl .vid video{position:absolute;inset:0;width:100%;height:100%;background:#000;object-fit:contain}
@media(max-width:640px){.invl .vid{border-radius:14px}
.invl .vid b{width:56px;height:56px;font-size:20px}}
.invl .tick{overflow:hidden;background:linear-gradient(90deg,#0284c7,#0ea5e9,#0284c7);padding:18px 0;transform:skewY(-1.2deg);margin:20px 0 40px;box-shadow:0 20px 40px -20px rgba(2,132,199,.6)}
.invl .tick div{display:flex;width:max-content;gap:48px;white-space:nowrap;animation:inv-marquee 30s linear infinite}
.invl .tick span{font-size:13px;font-weight:900;letter-spacing:.3em;color:#fff}
.invl .tick span:after{content:'▲';color:#a5f3fc;margin-left:48px;font-size:10px}
.invl section.s{padding:96px 0}
.invl .eyebrow{font-size:11px;font-weight:800;letter-spacing:.32em;text-transform:uppercase;color:var(--b1)}
.invl h2{font-size:clamp(32px,4.8vw,56px);font-weight:900;letter-spacing:-.03em;text-transform:uppercase;margin-top:12px;max-width:820px;line-height:1.02}
.invl .lead{margin-top:16px;max-width:640px;color:#43556b;line-height:1.7}
.invl .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px}
@media(max-width:900px){.invl .g3{grid-template-columns:1fr}}
.invl .gl{position:relative;overflow:hidden;border-radius:30px;border:1px solid #bae6fd;background:linear-gradient(160deg,#fff,#eef8ff);box-shadow:0 6px 28px -10px rgba(2,132,199,.25);transition:transform .4s,border-color .4s,box-shadow .4s;padding:30px;height:100%}
.invl .gl:before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;background:radial-gradient(380px circle at var(--mx,50%) var(--my,50%),rgba(56,189,248,.28),transparent 60%);pointer-events:none}
.invl .gl:hover{transform:translateY(-8px);border-color:#38bdf8;box-shadow:0 28px 54px -16px rgba(2,132,199,.5)}
.invl .gl:hover:before{opacity:1}
.invl .gl>*{position:relative}
.invl .ic{width:50px;height:50px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;margin-bottom:20px;background:linear-gradient(135deg,#38bdf8,#0284c7);box-shadow:0 12px 24px -8px rgba(2,132,199,.7)}
.invl .gl h3{font-size:18px;font-weight:900;color:#0369a1}
.invl .gl p{margin-top:8px;font-size:14px;line-height:1.65;color:#475569}
.invl .num{position:absolute!important;right:22px;top:6px;font-size:76px;font-weight:900;color:#e0f2fe}
.invl .dark{background:linear-gradient(160deg,#0c4a6e,#0369a1 60%,#0ea5e9);color:#fff;position:relative;overflow:hidden}
.invl .dark h2{color:#fff}
.invl .dark .eyebrow{color:#a5f3fc}
.invl .dark .lead{color:#e0f2fe}
.invl .dark .gl{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.28);backdrop-filter:blur(10px);box-shadow:none}
.invl .dark .gl h3{color:#fff}
.invl .dark .gl p{color:#e0f2fe}
.invl .dark .ic{background:rgba(255,255,255,.2)}
.invl .bento{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:52px}
.invl .bento .big{grid-column:span 2;grid-row:span 2}
.invl .bento .wide{grid-column:span 2}
@media(max-width:900px){.invl .bento{grid-template-columns:1fr 1fr}
.invl .bento .big,.invl .bento .wide{grid-column:span 2;grid-row:auto}}
@media(max-width:560px){.invl .bento{grid-template-columns:1fr}
.invl .bento .big,.invl .bento .wide{grid-column:auto}}
.invl .mini{margin-top:18px;border:1px solid rgba(255,255,255,.3);border-radius:16px;padding:12px;background:rgba(255,255,255,.12);font-size:11px;font-weight:900}
.invl .mini .track{height:6px;background:rgba(255,255,255,.25)}
.invl .mini .track div{background:#fff}
.invl .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:60px;position:relative;text-align:center}
@media(max-width:800px){.invl .steps{grid-template-columns:1fr}}
.invl .steps:before{content:'';position:absolute;left:16%;right:16%;top:34px;height:2px;background:linear-gradient(90deg,transparent,#38bdf8,transparent)}
.invl .circ{width:70px;height:70px;border-radius:50%;margin:0 auto 20px;border:1.5px solid #7dd3fc;background:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;color:#0ea5e9;position:relative;animation:inv-pulse 2.4s infinite}
.invl .circ b{position:absolute;right:-5px;top:-5px;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center}
.invl .steps h3{font-size:17px;font-weight:900;color:#0369a1}
.invl .steps p{font-size:14px;color:#475569;margin-top:8px}
.invl .plans{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:56px;max-width:920px;margin-inline:auto}
@media(max-width:800px){.invl .plans{grid-template-columns:1fr}}
.invl .feat{position:relative;border-radius:32px;padding:2px;background:linear-gradient(135deg,#38bdf8,#22d3ee,#0284c7);box-shadow:0 34px 70px -22px rgba(14,165,233,.8)}
.invl .feat>div{background:#fff;border-radius:30px;padding:32px;height:100%}
.invl .badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);padding:6px 18px;border-radius:99px;color:#fff;font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;background:linear-gradient(135deg,#0ea5e9,#0284c7);z-index:2}
.invl .plans ul{list-style:none;margin:22px 0 30px}
.invl .plans li{padding:7px 0;font-size:14px;color:#334155}
.invl .plans li:before{content:'✓';color:#0ea5e9;font-weight:900;margin-right:10px}
.invl .plans small{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8}
.invl .plans .btn{width:100%}
.invl .faq{max-width:780px;margin:44px auto 0}
.invl .q{border:1px solid #bae6fd;border-radius:18px;margin-bottom:12px;background:#fff;transition:.3s}
.invl .q.open{border-color:#38bdf8;background:#f0f9ff;box-shadow:0 10px 24px -10px rgba(2,132,199,.35)}
.invl .q button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 22px;border:0;background:none;font:inherit;font-size:14px;font-weight:800;color:var(--ink);text-align:left;cursor:pointer}
.invl .q button:after{content:'⌄';color:#0ea5e9;font-size:20px;transition:transform .3s}
.invl .q.open button:after{transform:rotate(180deg)}
.invl .q .a{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s}
.invl .q.open .a{grid-template-rows:1fr}
.invl .q .a div{overflow:hidden}
.invl .q .a p{padding:0 22px 20px;font-size:14px;line-height:1.65;color:#475569}
.invl .final{position:relative;overflow:hidden;max-width:1060px;margin:0 auto;border-radius:40px;padding:80px 24px;text-align:center;background:linear-gradient(135deg,#0c4a6e,#0284c7 55%,#22d3ee);box-shadow:0 50px 90px -24px rgba(2,132,199,.7)}
.invl .final h2{color:#fff;margin:0 auto}
.invl .final p{color:#e0f2fe;margin:18px auto 0;max-width:540px;line-height:1.7}
.invl .final .btn{background:#fff;color:#0284c7}
.invl footer{border-top:1px solid #bae6fd;background:#f0f9ff;padding:44px 0}
.invl footer .wrap{display:flex;gap:24px;justify-content:space-between;flex-wrap:wrap}
.invl footer p{max-width:560px;font-size:11px;line-height:1.7;color:#64748b}
.invl .copy{max-width:1240px;margin:28px auto 0;padding:0 28px;font-size:11px;color:#94a3b8}
.invl{overflow-x:clip}
@keyframes inv-gshift{to{background-position:200% 0}}
@keyframes inv-gspin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes inv-wave{0%{opacity:.8;transform:translate(-50%,-50%) scale(.6)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.55)}}
@keyframes inv-sway{0%,100%{transform:rotateY(-8deg) rotateX(2deg)}50%{transform:rotateY(8deg) rotateX(-3deg)}}
@keyframes inv-cue{0%{transform:translateY(0);opacity:1}100%{transform:translateY(12px);opacity:0}}
.invl .grad{background:linear-gradient(100deg,#0369a1,#0ea5e9,#22d3ee,#0ea5e9,#0369a1);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:inv-gshift 6s linear infinite}
.invl .ring i{top:0!important}
.invl .wave{position:absolute;left:50%;top:48%;width:56%;aspect-ratio:1;border-radius:50%;border:2px solid rgba(14,165,233,.55);opacity:0;animation:inv-wave 4.2s ease-out infinite;pointer-events:none}
.invl .gemorb{position:absolute;left:50%;top:48%;width:96%;aspect-ratio:1;animation:inv-gspin 22s linear infinite;pointer-events:none}
.invl .gemorb i{position:absolute;inset:0;transform:rotate(var(--a))}
.invl .gemorb i:before{content:'';position:absolute;left:50%;top:-8px;width:16px;height:16px;margin-left:-8px;background:linear-gradient(135deg,#fff,#38bdf8);transform:rotate(45deg);box-shadow:0 0 20px 4px rgba(56,189,248,.8);border-radius:3px}
.invl #bg{position:absolute;inset:0;width:100%;height:100%;opacity:.55;-webkit-mask-image:linear-gradient(to bottom,#000 25%,transparent 92%);mask-image:linear-gradient(to bottom,#000 25%,transparent 92%);pointer-events:none}
.invl #loader{position:fixed;inset:0;z-index:999;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;transition:opacity .7s,visibility .7s}
.invl #loader.off{opacity:0;visibility:hidden}
.invl .lcore{position:relative;width:96px;height:96px;display:flex;align-items:center;justify-content:center}
.invl .lcore svg{position:absolute;inset:0;transform:rotate(-90deg)}
.invl .lcore .lr{animation:inv-draw 1.2s ease-out forwards}
.invl .lcore b{font-weight:900;color:#0ea5e9;letter-spacing:.05em}
.invl #loader p{font-weight:900;letter-spacing:.35em;font-size:12px;color:#0c4a6e}
.invl #loader p span{color:#0ea5e9}
.invl:not(.ready) h1 .l span{animation-play-state:paused}
.invl #spot{display:none;position:fixed;left:0;top:0;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.16),transparent 65%);pointer-events:none;z-index:60;will-change:transform}
@media(hover:hover) and (pointer:fine){.invl #spot{display:block}}
.invl .cue{position:absolute;left:50%;bottom:16px;width:24px;height:38px;margin-left:-12px;border:2px solid #7dd3fc;border-radius:99px;z-index:4}
.invl .cue:after{content:'';position:absolute;left:50%;top:7px;width:4px;height:8px;margin-left:-2px;border-radius:4px;background:#0ea5e9;animation:inv-cue 1.6s ease-in infinite}
.invl .burger{display:none;width:44px;height:44px;border-radius:50%;border:1px solid #bae6fd;background:#fff;cursor:pointer;flex-direction:column;align-items:center;justify-content:center;gap:4px}
.invl .burger i{display:block;width:18px;height:2px;border-radius:2px;background:#0284c7;transition:.3s}
.invl .burger.open i:nth-child(1){transform:translateY(6px) rotate(45deg)}
.invl .burger.open i:nth-child(2){opacity:0}
.invl .burger.open i:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
.invl .nr{display:flex;align-items:center;gap:8px}
.invl .drawer{display:none;max-width:1180px;margin:8px auto 0;border-radius:28px;padding:10px;flex-direction:column;gap:2px}
.invl .drawer.open{display:flex}
.invl .drawer a{padding:15px 18px;border-radius:18px;font-weight:800;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#0c4a6e}
.invl .drawer a:active,.invl .drawer a:hover{background:#e0f2fe}
@media(max-width:860px){.invl .burger{display:flex}}
@media(min-width:861px){.invl .drawer{display:none!important}}
.invl .chartwrap{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.2fr);gap:48px;align-items:center}
@media(max-width:900px){.invl .chartwrap{grid-template-columns:1fr;gap:32px}}
.invl .legend{list-style:none;margin:28px 0 26px;display:grid;gap:10px}
.invl .legend li{display:flex;gap:14px;align-items:flex-start;padding:14px 16px;border-radius:18px;border:1px solid #e0f2fe;background:#fff;font-size:14px;color:#475569;line-height:1.5;transition:.5s;opacity:.55}
.invl .legend li b{display:block;color:#0c4a6e;font-size:14px}
.invl .legend li i{flex:none;width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:13px;color:#fff;background:linear-gradient(135deg,#38bdf8,#0284c7)}
.invl .legend li.on{opacity:1;border-color:#38bdf8;box-shadow:0 14px 30px -14px rgba(2,132,199,.5);transform:translateX(6px)}
.invl .chartbox{border-radius:32px;border:1px solid #bae6fd;background:linear-gradient(160deg,#fff,#eaf6ff);padding:16px;box-shadow:0 40px 80px -30px rgba(2,132,199,.45);position:relative}
.invl .chartbox svg{display:block;width:100%;height:auto}
.invl .chartbox small{display:block;text-align:center;margin-top:8px;font-size:11px;color:#94a3b8}
.invl .cd{opacity:0;transform:scaleY(.1);transform-box:fill-box;transform-origin:bottom;transition:opacity .4s,transform .5s cubic-bezier(.2,.8,.2,1)}
.invl .cd.on{opacity:1;transform:none}
.invl .z{opacity:0;transform:scaleX(.15);transform-box:fill-box;transform-origin:left;transition:opacity .7s,transform .9s cubic-bezier(.2,.8,.2,1)}
.invl .z.on{opacity:1;transform:none}
.invl .pop{opacity:0;transform:scale(.3);transform-box:fill-box;transform-origin:center;transition:opacity .5s,transform .6s cubic-bezier(.3,1.6,.5,1)}
.invl .pop.on{opacity:1;transform:none}
.invl .cl{font-weight:900;font-size:19px;letter-spacing:.04em}
@media(max-width:960px){.invl .hero{padding:100px 0 40px;min-height:auto}
.invl .hero .cols{min-height:0;gap:20px}
.invl h1 .l{white-space:normal}
.invl .scene{height:auto;aspect-ratio:1/1;min-height:0;max-width:540px;margin:0 auto;order:-1}
.invl .slabs{scale:.7}
.invl .cue{display:none}}
@media(max-width:640px){.invl .hero{padding-top:84px}
.invl .scene{max-width:340px}
.invl .wrap{padding:0 20px}
.invl header{top:8px;padding:0 10px}
.invl .nav{height:54px;padding:0 6px 0 14px}
.invl .nav .btn{padding:10px 16px;font-size:10px}
.invl .sub{font-size:14px;margin-top:18px}
.invl .btn{padding:16px 26px}
.invl .cta .btn{flex:1 1 100%}
.invl .cards{gap:10px;margin-top:30px}
.invl .card{padding:14px 16px;border-radius:22px;flex:1 1 calc(50% - 10px)}
.invl .card.live{flex-basis:100%}
.invl .card b{font-size:24px}
.invl .fc{font-size:10px;padding:8px 12px;border-radius:14px;max-width:62%}
.invl .fc.hs{display:none}
.invl .slabs{scale:.48}
.invl .prev{padding:0 14px 50px;margin-top:0}
.invl .pm{padding:14px}
.invl .mods{grid-template-columns:1fr}
.invl section.s{padding:64px 0}
.invl .gl{padding:24px;border-radius:24px}
.invl .plans{margin-top:40px}
.invl .final{padding:56px 20px;border-radius:30px}
.invl .tick span{font-size:11px;letter-spacing:.2em}
.invl .steps:before{display:none}
.invl .chartbox{padding:10px;border-radius:24px}
.invl .legend li{padding:12px}
.invl .cl{font-size:22px}}
@media(max-width:767px){.invl .scene{display:none}
.invl .hero{padding-top:96px;padding-bottom:30px}
.invl .hero .cols{gap:0}
.invl h1{font-size:clamp(34px,10.5vw,52px)}}
@media(max-width:480px){.invl .lt{display:none}}
@media(hover:none){.invl .rig{animation:inv-sway 9s ease-in-out infinite}}
@media(prefers-reduced-motion:reduce){.invl *,.invl *:before,.invl *:after{animation:none!important;transition:none!important}
.invl .reveal,.invl h1 .l span{opacity:1;transform:none}
.invl .cd,.invl .z,.invl .pop{opacity:1!important;transform:none!important}}
.invl .lnk{font-size:12px;font-weight:800;padding:8px 14px;color:#334155;letter-spacing:.04em}
.invl .lnk:hover{color:#0ea5e9}
@media(max-width:860px){.invl .lnk{display:none}}
.invl .vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.invl section[id]{scroll-margin-top:90px}
.invl #loader{animation:inv-loaderOut .01s 7s forwards}
@keyframes inv-loaderOut{to{opacity:0;visibility:hidden}}`