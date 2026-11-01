// Textos y estructura de la landing. Aquí se editan los textos.
export const LANDING_HTML = `<div id="loader"><div class="lcore"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#bae6fd" stroke-width="3"/><circle class="lr" cx="50" cy="50" r="46" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-dasharray="290" stroke-dashoffset="290"/></svg><b>IC</b></div><p>INVICTUS <span>CAMPUS</span></p></div>
<div id="spot"></div>
<div id="bar"></div>

<header>
  <div class="nav glassbar">
    <a class="logo" href="/">
      <svg viewBox="0 0 40 40" aria-label="Cristal Invictus">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/></linearGradient>
          <linearGradient id="lgA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bfe4fb"/></linearGradient>
          <linearGradient id="lgB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf6ff"/><stop offset="1" stop-color="#8fcdf2"/></linearGradient>
          <linearGradient id="lgC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe4fb"/><stop offset="1" stop-color="#5aa9db"/></linearGradient>
          <linearGradient id="lgD" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcf0fc"/><stop offset="1" stop-color="#9fd4f3"/></linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill="url(#lg)"/>
        <g>
          <path d="M20 7L13 20 10 20 20 20Z" fill="url(#lgA)"/>
          <path d="M20 7L20 20 10 20Z" fill="url(#lgB)"/>
          <path d="M20 7L27 20 30 20 20 20Z" fill="url(#lgC)"/>
          <path d="M20 7L20 20 30 20Z" fill="url(#lgD)"/>
          <path d="M10 20L13 20 20 33Z" fill="url(#lgC)"/>
          <path d="M10 20L20 20 20 33Z" fill="url(#lgB)"/>
          <path d="M30 20L27 20 20 33Z" fill="url(#lgA)"/>
          <path d="M30 20L20 20 20 33Z" fill="url(#lgD)"/>
          <path d="M20 7L13 20 20 33 27 20Z" fill="none" stroke="#fff" stroke-width="1.1" stroke-linejoin="round" opacity=".95"/>
          <path d="M13 20L20 20 27 20" fill="none" stroke="#fff" stroke-width=".9" opacity=".85"/>
          <path d="M18 11L20.5 9 20 14Z" fill="#fff" opacity=".9"/>
        </g>
      </svg>
      <span class="lt">INVICTUS <b>CAMPUS</b></span>
    </a>
    <nav class="links"><a href="#top" class="on">Inicio</a><a href="#metodo">Metodología</a><a href="#plataforma">Plataforma</a><a href="#planes">Planes</a><a href="#faq">Preguntas</a></nav>
    <div class="nr"><a class="lnk" href="/login">Iniciar sesión</a><a class="osbtn" href="https://invictus-os.netlify.app/"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2.5"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg><span>Invictus OS</span></a><button class="tg" id="themeBtn" type="button" aria-label="Cambiar entre modo claro y modo noche" title="Modo noche / claro"><span class="s">☀</span><span class="m">☾</span></button><button class="burger" id="burger" aria-label="Menú" aria-expanded="false"><i></i><i></i><i></i></button></div>
  </div>
  <nav class="drawer glassbar" id="drawer"><a href="#top">Inicio</a><a href="#metodo">Metodología</a><a href="#plataforma">Plataforma</a><a href="#planes">Planes</a><a href="#faq">Preguntas</a><a href="/login">Iniciar sesión</a><a href="https://invictus-os.netlify.app/">Invictus OS</a></nav>
</header>

<section class="hero" id="top">
  <canvas id="bg"></canvas>
  <div class="grid"></div>
  <div class="bigtxt" id="big">MNQ</div>
  <div class="cue"></div>
  <div class="wrap cols">
    <div>
      <h1>
        <span class="l"><span style="animation-delay:.1s">Aprende</span> <span class="grad" id="word" style="animation-delay:.2s">Trading</span></span>
        <span class="l"><span style="animation-delay:.35s">como los</span></span>
        <span class="l"><span style="animation-delay:.5s">institucionales</span></span>
      </h1>
      <p class="sub reveal" style="transition-delay:.6s">Domina la metodología ICT sobre el Micro Nasdaq con clases grabadas, sesiones en vivo y seguimiento de tu progreso. Todo en un solo campus.</p>
      <div class="cta reveal" style="transition-delay:.75s">
        <a class="btn blue" href="/register">Empezar ahora →</a>
        <a class="btn ghost" href="#planes">Ver planes</a>
      </div>
      <div class="cards reveal" style="transition-delay:.9s">
        <div class="card"><b class="grad">MNQ</b><small>Foco total en Micro Nasdaq</small></div>
        <div class="card"><b class="grad">ICT</b><small>Metodología institucional</small></div>
        <div class="card live"><span class="dot"></span>Sesión de NY<br>en vivo</div>
      </div>
    </div>

    <div class="scene" id="scene">
      <div class="glow"></div>
      <i class="wave"></i><i class="wave" style="animation-delay:2.1s"></i>
      <div class="gemorb"><i style="--a:0deg"></i><i style="--a:120deg"></i><i style="--a:240deg"></i></div>
      <canvas id="cv"></canvas>
      <div class="ring" style="width:78%;aspect-ratio:1;transform:translate(-50%,-50%);animation:inv-gspin 40s linear infinite"><i></i></div>
      <div class="ring" style="width:100%;aspect-ratio:1;transform:translate(-50%,-50%);animation:inv-gspin 60s linear infinite reverse"><i style="background:#22d3ee"></i></div>
      <div class="rig" id="rig">
        
        <div class="bullw"><svg class="bull" viewBox="0 0 500 500" aria-label="Cristal Invictus">
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset=".45" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0369a1"/></linearGradient>
            <linearGradient id="disc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient>
            <linearGradient id="met" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#7dd3fc"/><stop offset=".7" stop-color="#0284c7"/><stop offset="1" stop-color="#0c4a6e"/></linearGradient>
            <linearGradient id="met2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0369a1"/><stop offset=".5" stop-color="#bae6fd"/><stop offset="1" stop-color="#0369a1"/></linearGradient>
            <linearGradient id="cry" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#bae6fd"/><stop offset="1" stop-color="#38bdf8"/></linearGradient>
            <linearGradient id="cry2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient>
            <linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="-200" y1="0" x2="-100" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
              <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="700 0" dur="3.6s" repeatCount="indefinite"/></linearGradient>
            <radialGradient id="halo"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#67e8f9" stop-opacity=".7"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
            <clipPath id="clipHelm"><path d="M168 330C160 230 200 180 250 178 300 180 340 230 332 330L318 340H182Z"/></clipPath>
            <clipPath id="clipDisc"><circle cx="250" cy="250" r="172"/></clipPath>
            <filter id="gl2"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <radialGradient id="disc2" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#0e5a86"/><stop offset=".6" stop-color="#0b3a5c"/><stop offset="1" stop-color="#062a45"/></radialGradient>
            <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f6ff"/><stop offset="1" stop-color="#7cc4f0"/></linearGradient>
            <linearGradient id="gB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bfe4fb"/></linearGradient>
            <linearGradient id="gC" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e6f5ff"/><stop offset="1" stop-color="#a9d9f6"/></linearGradient>
            <linearGradient id="gD" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4ecfb"/><stop offset="1" stop-color="#5eb0e4"/></linearGradient>
            <linearGradient id="gE" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a9d9f6"/><stop offset="1" stop-color="#4a9bd1"/></linearGradient>
            <linearGradient id="gF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f5ff"/><stop offset="1" stop-color="#7cc4f0"/></linearGradient>
            <linearGradient id="gG" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe9fb"/><stop offset="1" stop-color="#3f8fc8"/></linearGradient>
            <linearGradient id="gH" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ecbf0"/><stop offset="1" stop-color="#2a76ad"/></linearGradient>
            <clipPath id="clipGem"><path d="M250 88L172 252 250 416 328 252Z"/></clipPath>
            <path id="cr" d="M0 0 L9 34 L0 62 L-9 34Z"/>
          </defs>
          <!-- outer ring -->
          <circle cx="250" cy="250" r="240" fill="url(#ring)"/>
          <circle cx="250" cy="250" r="240" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>
          <circle cx="250" cy="250" r="226" fill="#0c4a6e"/>
          <circle cx="250" cy="250" r="226" fill="none" stroke="#38bdf8" stroke-width="3"/>
          <g id="keyring" style="transform-origin:250px 250px;animation:inv-spin 70s linear infinite"></g>
          <circle cx="250" cy="250" r="180" fill="none" stroke="#38bdf8" stroke-width="4"/>
          <circle cx="250" cy="250" r="172" fill="url(#disc2)"/>
          <circle cx="250" cy="250" r="172" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/>
<!-- cristal principal -->
          <circle cx="250" cy="250" r="150" fill="url(#halo)" style="animation:inv-haloP 3.4s ease-in-out infinite;transform-origin:250px 250px"/>
          <g class="gemf">
            <g style="animation:inv-twinkle 2.6s ease-in-out infinite">
              <g filter="url(#gl2)" opacity=".55"><path d="M250 84L334 252 250 420 166 252Z" fill="#7dd3fc"/></g>
              <path d="M250 88L172 252 222 262Z" fill="url(#gA)"/>
              <path d="M250 88L222 262 250 270Z" fill="url(#gB)"/>
              <path d="M250 88L250 270 278 262Z" fill="url(#gC)"/>
              <path d="M250 88L278 262 328 252Z" fill="url(#gD)"/>
              <path d="M172 252L222 262 250 416Z" fill="url(#gE)"/>
              <path d="M222 262L250 270 250 416Z" fill="url(#gF)"/>
              <path d="M250 270L278 262 250 416Z" fill="url(#gG)"/>
              <path d="M278 262L328 252 250 416Z" fill="url(#gH)"/>
              <path d="M250 88L172 252 250 416 328 252Z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round" opacity=".95"/>
              <path d="M172 252L222 262 250 270 278 262 328 252" fill="none" stroke="#fff" stroke-width="2" opacity=".9"/>
              <path d="M250 88L222 262 250 416M250 88L278 262 250 416" fill="none" stroke="#bae6fd" stroke-width="1.4" opacity=".75"/>
              <path d="M236 150L246 112 250 130Z" fill="#fff" opacity=".9"/>
              <path d="M204 262L226 330 214 300Z" fill="#fff" opacity=".5"/>
              <g clip-path="url(#clipGem)"><rect x="0" y="80" width="90" height="350" fill="url(#sweep)" transform="skewX(-18)" opacity=".9"/></g>
            </g>
          </g>
                    <!-- sparkles -->
          <g fill="#fff" filter="url(#gl2)">
            <path d="M250 18l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" style="animation:inv-spark 2.2s ease-in-out infinite;transform-origin:250px 30px"/>
            <path d="M330 130l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" style="animation:inv-spark 2.2s .7s ease-in-out infinite;transform-origin:330px 138px"/>
            <path d="M170 140l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" style="animation:inv-spark 2.2s 1.2s ease-in-out infinite;transform-origin:170px 148px"/>
            <path d="M214 436l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" style="animation:inv-spark 2.2s .4s ease-in-out infinite;transform-origin:214px 443px"/>
            <path d="M290 430l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" style="animation:inv-spark 2.2s 1s ease-in-out infinite;transform-origin:290px 437px"/>
          </g>
        </svg></div>
      </div>
      <div class="fc hs" style="right:-3%;top:72%;animation:inv-floaty 6s ease-in-out infinite">✦ Clases nuevas cada semana</div>
      <div class="fc" style="right:10%;top:6%;animation:inv-floaty 7s 1s ease-in-out infinite"><span class="dot"></span>Order Block detectado</div>
      <div class="fc" style="left:0;bottom:16%;animation:inv-floaty 7s .5s ease-in-out infinite">🛡 Acceso por niveles</div>
</div>
  </div>
</section>

<section class="prev">
  <div class="win" id="win">
    <div class="tb"><i style="background:#fda4af"></i><i style="background:#fcd34d"></i><i style="background:#6ee7b7"></i><em>invictus campus · mis clases</em></div>
    <div class="pb">
      <div class="side"><div class="mem"><small>Membresía</small><p>Club · Mentoría</p></div><div class="i a">Mis clases</div><div class="i">Mi perfil</div></div>
      <div class="pm">
        <div class="vid" id="vid" role="button" tabindex="0" aria-label="Reproducir video de la academia">
          <img src="__POSTER__" alt="" loading="lazy" onerror="this.onerror=null;this.src=this.src.replace('maxresdefault','hqdefault')">
          <b>▶</b>
        </div>
        <div class="prog"><span>Tu progreso</span><span style="color:#0284c7">Avanzando</span></div>
        <div class="track"><div style="width:42%"></div></div>
        <div class="mods">
          <div><h6>Módulo 1</h6><span class="ok">●</span> Lección 1<br><span class="ok">●</span> Lección 2<br><span class="no">○</span> Lección 3</div>
          <div><h6>Módulo 2</h6><span class="ok">●</span> Lección 1<br><span class="no">○</span> Lección 2<br><span class="no">○</span> Lección 3</div>
          <div><h6>Módulo 3</h6><span class="no">○</span> Lección 1<br><span class="no">○</span> Lección 2<br><span class="no">○</span> Lección 3</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="tick"><div id="tick"></div></div>

<section class="s" id="testimonios" style="display:none;padding-top:56px;padding-bottom:40px">
  <div class="wrap">
    <div class="reveal" style="text-align:center"><p class="eyebrow">Resultados de alumnos</p><h2 class="grad" style="margin-inline:auto">Lo que dicen nuestros alumnos</h2></div>
    <div class="tcarousel">
      <button class="tnav tprev" type="button" id="tprev" aria-label="Testimonios anteriores">&#8249;</button>
      <div class="tstack" id="tstack"></div>
      <button class="tnav tnext" type="button" id="tnext" aria-label="Testimonios siguientes">&#8250;</button>
    </div>
  </div>
</section>

<section class="s" id="metodo">
  <div class="wrap">
    <div class="reveal"><p class="eyebrow">Metodología</p><h2 class="grad">Una forma estructurada de leer el mercado</h2>
    <p class="lead">Aprende a identificar order blocks, liquidez y puntos institucionales en temporalidades menores, y a ejecutar con un plan definido.</p></div>
    <div class="g3">
      <div class="reveal"><div class="gl"><span class="num">01</span><div class="ic">▤</div><h3>Estructura de mercado</h3><p>Lee la dirección del precio y entiende dónde está el interés institucional.</p></div></div>
      <div class="reveal" style="transition-delay:.13s"><div class="gl"><span class="num">02</span><div class="ic">◎</div><h3>Puntos de entrada</h3><p>Order blocks, fair value gaps y zonas de liquidez con criterios claros.</p></div></div>
      <div class="reveal" style="transition-delay:.26s"><div class="gl"><span class="num">03</span><div class="ic">⛨</div><h3>Gestión del riesgo</h3><p>Define tu riesgo antes de entrar. La constancia se construye protegiendo el capital.</p></div></div>
    </div>
  </div>
</section>

<section class="s dark" id="plataforma">
  <div class="wrap">
    <div class="reveal"><p class="eyebrow">Plataforma</p><h2>Todo lo que necesitas, en un solo campus</h2></div>
    <div class="bento">
      <div class="big reveal"><div class="gl"><div class="ic">▶</div><h3>Clases y grabaciones</h3><p>Biblioteca organizada por módulos. Míralas cuando quieras y retoma donde lo dejaste.</p>
        <div class="mini"><div style="display:flex;justify-content:space-between"><span>Módulo 1</span><span>✓</span></div><div class="track"><div style="width:100%"></div></div></div>
        <div class="mini"><span>Módulo 2</span><div class="track"><div style="width:55%"></div></div></div>
        <div class="mini"><span>Módulo 3</span><div class="track"><div style="width:15%"></div></div></div></div></div>
      <div class="reveal" style="transition-delay:.1s"><div class="gl"><div class="ic">◉</div><h3>Sesiones en vivo</h3><p>Sala abierta para seguir la operativa de Nueva York en tiempo real.</p></div></div>
      <div class="reveal" style="transition-delay:.2s"><div class="gl"><div class="ic">▣</div><h3>Material educativo</h3><p>PDFs, guías y recursos para estudiar y repasar la metodología.</p></div></div>
      <div class="wide reveal" style="transition-delay:.1s"><div class="gl" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        <div style="flex:1;min-width:180px"><div class="ic">◎</div><h3>Foco en MNQ</h3><p>Todo el contenido se centra en el Micro Nasdaq bajo la metodología ICT.</p></div>
        <svg viewBox="0 0 200 90" style="width:190px;height:96px"><path d="M0 80 C25 70 40 75 60 55 S100 40 125 30 S170 18 200 6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="300" stroke-dashoffset="300" style="animation:inv-draw 2.4s .3s ease-out forwards"/></svg></div></div>
      <div class="reveal" style="transition-delay:.2s"><div class="gl"><div class="ic">↗</div><h3>Progreso por clase</h3><p>Marca lecciones completadas y retoma justo donde lo dejaste.</p></div></div>
      <div class="reveal" style="transition-delay:.3s"><div class="gl"><div class="ic">⛨</div><h3>Acceso controlado</h3><p>Cada alumno es aprobado manualmente: un entorno cuidado y enfocado.</p></div></div>
    </div>
  </div>
</section>

<section class="s">
  <div class="wrap">
    <div class="reveal"><p class="eyebrow">Cómo funciona</p><h2 class="grad">Tres pasos para entrar</h2></div>
    <div class="steps">
      <div class="reveal"><div class="circ">＋<b>1</b></div><h3>Crea tu cuenta</h3><p>Regístrate con tu correo en un minuto.</p></div>
      <div class="reveal" style="transition-delay:.16s"><div class="circ">✓<b>2</b></div><h3>Aprobación</h3><p>El equipo revisa tu solicitud y activa tu acceso.</p></div>
      <div class="reveal" style="transition-delay:.32s"><div class="circ">▶<b>3</b></div><h3>Empieza a aprender</h3><p>Entra a las clases, el material y las sesiones de tu nivel.</p></div>
    </div>
  </div>
</section>

<section class="s" id="planes" style="padding-top:20px">
  <div class="wrap">
    <div class="reveal" style="text-align:center"><p class="eyebrow">Niveles de acceso</p><h2 class="grad" style="margin-inline:auto">Elige tu camino</h2></div>
    <div class="plans">
      <div class="reveal"><div class="gl" style="padding:34px"><small>Club</small><h3 style="font-size:24px;margin-top:8px">Invictus Club</h3><p>Para quienes quieren aprender la metodología y operar con estructura.</p>
        <ul><li>Clases y grabaciones del club</li><li>Material educativo</li><li>Sesiones en vivo</li></ul><a class="btn ghost" href="/register">Solicitar acceso →</a></div></div>
      <div class="reveal" style="transition-delay:.15s"><div class="feat"><span class="badge">Más completo</span><div>
        <small style="color:#0ea5e9">Mentoría</small><h3 style="font-size:24px;margin-top:8px;font-weight:900;color:#0369a1">Mentoría Invictus</h3><p style="margin-top:8px;font-size:14px;color:#475569;line-height:1.6">Todo lo del Club, más el contenido exclusivo del programa de mentoría.</p>
        <ul><li>Todo lo incluido en Club</li><li>Clases exclusivas de mentoría</li><li>Material avanzado</li><li>Seguimiento más cercano</li></ul><a class="btn blue" href="/register">Solicitar acceso →</a></div></div></div>
    </div>
  </div>
</section>

<section class="s" id="faq" style="padding-top:30px">
  <div class="wrap"><h2 class="grad reveal" style="text-align:center;margin-inline:auto">Preguntas frecuentes</h2><div class="faq" id="faqs"></div></div>
</section>

<section style="padding:0 24px 96px">
  <div class="final reveal">
    <div class="grid" style="opacity:.25"></div>
    <div style="position:relative"><h2>Tu próximo nivel empieza aquí</h2>
    <p>Únete a Invictus Campus y trabaja tu operativa con método, constancia y acompañamiento.</p>
    <div class="cta" style="justify-content:center"><a class="btn" href="/register">Crear mi cuenta →</a><a class="btn ghost" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.6)" href="/login">Iniciar sesión</a></div></div>
  </div>
</section>

<footer>
  <div class="wrap"><a class="logo" href="/">INVICTUS <b>CAMPUS</b></a>
  <p>Aviso de riesgo: operar en mercados financieros implica un riesgo significativo de pérdida. El contenido de Invictus Campus es exclusivamente educativo y no constituye asesoramiento financiero ni recomendación de inversión. Los resultados pasados no garantizan resultados futuros.</p></div>
  <p class="copy">© 2026 Invictus Campus. Todos los derechos reservados.</p>
</footer>`
