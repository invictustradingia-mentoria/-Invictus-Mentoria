// Textos y estructura de la landing. Aquí se editan los textos.
export const LANDING_HTML = `<div id="loader"><div class="lcore"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#bae6fd" stroke-width="3"/><circle class="lr" cx="50" cy="50" r="46" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-dasharray="290" stroke-dashoffset="290"/></svg><b>IC</b></div><p>INVICTUS <span>CAMPUS</span></p></div>
<div id="spot"></div>
<div id="bar"></div>

<header>
  <div class="nav glassbar">
    <a class="logo" href="/">
      <svg viewBox="0 0 40 40"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#lg)"/><path d="M20 6l2.5 6h-5zM11 24c0-7 4-11 9-11s9 4 9 11v2h-3l-1-4h-10l-1 4h-3z" fill="#fff"/><path d="M18 24h4l1 9h-6z" fill="#fff"/></svg>
      <span class="lt">INVICTUS <b>CAMPUS</b></span>
    </a>
    <nav class="links"><a href="#top" class="on">Inicio</a><a href="#metodo">Metodología</a><a href="#plataforma">Plataforma</a><a href="#planes">Planes</a><a href="#faq">Preguntas</a></nav>
    <div class="nr"><a class="lnk" href="/login">Iniciar sesión</a><a class="btn blue" href="/register">Crear cuenta</a><button class="burger" id="burger" aria-label="Menú" aria-expanded="false"><i></i><i></i><i></i></button></div>
  </div>
  <nav class="drawer glassbar" id="drawer"><a href="#top">Inicio</a><a href="#metodo">Metodología</a><a href="#plataforma">Plataforma</a><a href="#planes">Planes</a><a href="#faq">Preguntas</a><a href="/login">Iniciar sesión</a><a href="/register">Crear cuenta</a></nav>
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
        
        <div class="bullw"><svg class="bull" viewBox="0 0 500 500" aria-label="Emblema Invictus">
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
            <path id="cr" d="M0 0 L9 34 L0 62 L-9 34Z"/>
          </defs>
          <!-- outer ring -->
          <circle cx="250" cy="250" r="240" fill="url(#ring)"/>
          <circle cx="250" cy="250" r="240" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>
          <circle cx="250" cy="250" r="226" fill="#0c4a6e"/>
          <circle cx="250" cy="250" r="226" fill="none" stroke="#38bdf8" stroke-width="3"/>
          <g id="keyring" style="transform-origin:250px 250px;animation:inv-spin 70s linear infinite"></g>
          <circle cx="250" cy="250" r="180" fill="none" stroke="#38bdf8" stroke-width="4"/>
          <circle cx="250" cy="250" r="172" fill="url(#disc)"/>
          <circle cx="250" cy="250" r="172" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/>
          <!-- halo behind helmet -->
          <circle cx="250" cy="230" r="150" fill="url(#halo)" style="animation:inv-haloP 3.4s ease-in-out infinite;transform-origin:250px 230px"/>
          <!-- arrows -->
          <g style="animation:inv-arrUp 2.6s ease-in-out infinite">
            <path d="M118 335V245" stroke="#0ea5e9" stroke-width="7" stroke-linecap="round"/>
            <path d="M118 232L96 268H140Z" fill="#0ea5e9"/>
          </g>
          <g style="animation:inv-arrDown 2.6s ease-in-out infinite">
            <path d="M382 245V335" stroke="#6366f1" stroke-width="7" stroke-linecap="round"/>
            <path d="M382 348L360 312H404Z" fill="#6366f1"/>
          </g>
          <!-- crest crystals -->
          <g filter="url(#gl2)" opacity=".5"><use href="#cr" x="250" y="70" transform="translate(0 0) scale(1.9 1.9)" transform-origin="250 70" fill="#fff"/></g>
          <g transform="translate(250 175)">
            <g style="animation:inv-twinkle 3s ease-in-out infinite"><use href="#cr" transform="rotate(-72) translate(0 -128) scale(1.35 .95)" fill="url(#cry2)" stroke="#0284c7" stroke-width="1.5"/></g>
            <g style="animation:inv-twinkle 3s .3s ease-in-out infinite"><use href="#cr" transform="rotate(-48) translate(0 -138) scale(1.45 1.05)" fill="url(#cry)" stroke="#0284c7" stroke-width="1.5"/></g>
            <g style="animation:inv-twinkle 3s .6s ease-in-out infinite"><use href="#cr" transform="rotate(-24) translate(0 -142) scale(1.5 1.1)" fill="url(#cry2)" stroke="#0284c7" stroke-width="1.5"/></g>
            <g style="animation:inv-twinkle 3s .3s ease-in-out infinite"><use href="#cr" transform="rotate(72) translate(0 -128) scale(1.35 .95)" fill="url(#cry2)" stroke="#0284c7" stroke-width="1.5"/></g>
            <g style="animation:inv-twinkle 3s .6s ease-in-out infinite"><use href="#cr" transform="rotate(48) translate(0 -138) scale(1.45 1.05)" fill="url(#cry)" stroke="#0284c7" stroke-width="1.5"/></g>
            <g style="animation:inv-twinkle 3s ease-in-out infinite"><use href="#cr" transform="rotate(24) translate(0 -142) scale(1.5 1.1)" fill="url(#cry2)" stroke="#0284c7" stroke-width="1.5"/></g>
          </g>
          <!-- main crystal -->
          <g style="animation:inv-twinkle 2.4s ease-in-out infinite">
            <path d="M250 38L276 104 266 150H234L224 104Z" fill="url(#cry)" stroke="#0284c7" stroke-width="2"/>
            <path d="M250 38L250 150M224 104H276M250 38L234 150M250 38L266 150" stroke="#fff" stroke-width="1.5" opacity=".8" fill="none"/>
            <path d="M232 104L250 38 244 104Z" fill="#fff" opacity=".7"/>
          </g>
          <!-- crest base -->
          <path d="M226 148H274L284 186H216Z" fill="url(#met)" stroke="#0c4a6e" stroke-width="2"/>
          <!-- dome -->
          <path d="M168 330C160 230 200 180 250 178 300 180 340 230 332 330L318 340H182Z" fill="url(#met)" stroke="#0c4a6e" stroke-width="3"/>
          <path d="M184 300C182 240 210 198 250 190" stroke="#fff" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"/>
          <!-- brow band -->
          <path d="M160 268L250 240 340 268 340 296 250 270 160 296Z" fill="url(#met2)" stroke="#0c4a6e" stroke-width="2.5"/>
          <path d="M238 266L250 244 262 266" stroke="#0c4a6e" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- face opening -->
          <path d="M190 296H310L300 346H274L264 398H236L226 346H200Z" fill="#06223a"/>
          <path d="M238 286H262L268 380 250 414 232 380Z" fill="url(#met)" stroke="#0c4a6e" stroke-width="2.5"/>
          <path d="M250 292V396" stroke="#fff" stroke-width="3" opacity=".6"/>
          <!-- cheek crystals -->
          <g style="animation:inv-twinkle 3.4s .2s ease-in-out infinite">
            <path d="M190 302L226 308 233 350 228 428 204 448 190 384Z" fill="url(#cry)" stroke="#0284c7" stroke-width="2.5"/>
            <path d="M190 302L214 372 204 448M226 308L214 372 228 428M214 372L190 384" stroke="#fff" stroke-width="1.6" fill="none" opacity=".85"/>
          </g>
          <g style="animation:inv-twinkle 3.4s .5s ease-in-out infinite">
            <path d="M310 302L274 308 267 350 272 428 296 448 310 384Z" fill="url(#cry2)" stroke="#0284c7" stroke-width="2.5"/>
            <path d="M310 302L286 372 296 448M274 308L286 372 272 428M286 372L310 384" stroke="#fff" stroke-width="1.6" fill="none" opacity=".85"/>
          </g>
          <!-- light sweep -->
          <g clip-path="url(#clipHelm)"><rect x="0" y="150" width="100" height="220" fill="url(#sweep)" transform="skewX(-20)" opacity=".85"/></g>
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

<section class="s" id="chart" style="padding-bottom:40px">
  <div class="wrap chartwrap">
    <div class="reveal">
      <p class="eyebrow">Lectura de mercado</p>
      <h2 class="grad">Así piensa un trader institucional</h2>
      <p class="lead">Mira cómo se construye una operación paso a paso: del barrido de liquidez a una entrada con riesgo definido.</p>
      <ul class="legend" id="legend">
        <li data-s="1"><i>1</i><div><b>Liquidez barrida</b>El precio rompe mínimos iguales y recoge órdenes.</div></li>
        <li data-s="2"><i>2</i><div><b>Order Block</b>La última vela bajista antes del desplazamiento.</div></li>
        <li data-s="3"><i>3</i><div><b>Fair Value Gap</b>El desequilibrio al que el precio suele volver.</div></li>
        <li data-s="4"><i>4</i><div><b>Entrada y gestión</b>Stop protegido y objetivo definido antes de entrar.</div></li>
      </ul>
      <button class="btn ghost" id="replay">↻ Repetir animación</button>
    </div>
    <div class="reveal chartbox" style="transition-delay:.15s">
      <svg id="mk" viewBox="0 0 640 330" role="img" aria-label="Gráfico ilustrativo de velas con liquidez, order block, fair value gap y entrada"></svg>
      <small>Ilustración educativa, no es una señal de operación.</small>
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