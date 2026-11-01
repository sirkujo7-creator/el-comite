/* =========================================================
   ESCENAS DE LAS CINEMÁTICAS — flashbacks (nov. 2026)
   Cada frase de una cinemática puede llevar una escena: una ilustración plana (SVG, sin
   archivos) en la paleta de la Sala de mando, con la silueta del protagonista, que sigue la
   historia narrada. Se muestra como recuerdo: entra con un destello, se acerca despacio y
   tiembla levemente, con viñeta y grano (styles/cinematica.css).
   ========================================================= */
const ESC = { fondo:'#0c0e11', panel:'#16191e', hueso:'#ece6d8', ambar:'#ffb000', rojo:'#ff5a46', verde:'#3ddc97', frio:'#24324a', sombra:'#050608' };
function escaparEscena(t){ return String(t || '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
// Luz radial reutilizable (bombilla, lámpara, monitor).
function luzEscena(id, color, x, y, r, opacidad){
  return `<defs><radialGradient id="${id}" cx="${x}" cy="${y}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color}" stop-opacity="${opacidad}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><rect width="480" height="270" fill="url(#${id})"/>`;
}
// El protagonista: siempre la misma silueta (abrigo, cabello corto), con un filo de luz.
function siluetaProtagonista(x, y, escala, pose, luz){
  const s = escala || 1, borde = luz || ESC.ambar;
  const formas = {
    pie: `<circle cx="0" cy="-104" r="11"/><rect x="-4" y="-95" width="8" height="7"/><polygon points="-17,-89 17,-89 22,-40 14,-38 12,0 3,0 1,-34 -1,-34 -3,0 -12,0 -14,-38 -22,-40"/>`,
    sentado: `<circle cx="-6" cy="-66" r="10"/><polygon points="-18,-56 10,-55 14,-22 -14,-22"/><polygon points="-14,-24 26,-24 28,-16 -14,-16"/><polygon points="20,-18 28,-18 26,2 20,2"/>`,
    espalda: `<circle cx="0" cy="-58" r="20"/><polygon points="-46,0 -40,-28 -22,-38 22,-38 40,-28 46,0"/>`
  }[pose || 'pie'];
  return `<g transform="translate(${x},${y}) scale(${s})"><g transform="translate(1.6,0)" fill="${borde}" opacity=".55">${formas}</g><g fill="${ESC.sombra}">${formas}</g></g>`;
}
function ventanasEdificio(x, y, ancho, alto, semilla, color){
  let r = semilla, out = '';
  for(let fy = y + 8; fy < y + alto - 6; fy += 11) for(let fx = x + 5; fx < x + ancho - 6; fx += 9){
    r = (r * 16807) % 2147483647;
    if(r % 5 === 0) out += `<rect x="${fx}" y="${fy}" width="4" height="5" fill="${color}" opacity="${0.35 + (r % 7) / 12}"/>`;
  }
  return out;
}

const ESCENAS = {
  // Habitación sin pagar: bombilla desnuda, persiana con luz de la calle, alguien sentado al borde de la cama.
  cuarto: ()=>`
    <rect width="480" height="270" fill="#111318"/><rect y="200" width="480" height="70" fill="#0a0b0d"/>
    <rect x="320" y="50" width="110" height="110" fill="${ESC.frio}"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="320" y="${54+i*13}" width="110" height="7" fill="#0c0e11"/>`).join('')}
    <polygon points="320,160 430,160 470,270 280,270" fill="${ESC.ambar}" opacity=".05"/>
    <line x1="210" y1="0" x2="210" y2="58" stroke="#2a2d33" stroke-width="2"/>${luzEscena('lzCuarto', ESC.ambar, 210, 66, 170, .45)}<circle cx="210" cy="66" r="8" fill="#ffd98a"/>
    <rect x="60" y="178" width="190" height="26" fill="#1b1e24"/><rect x="60" y="170" width="44" height="12" fill="#262a31"/>
    ${siluetaProtagonista(170, 204, 1.05, 'sentado')}`,
  // Saldo en cero: el resplandor rojo de una pantalla que dice $0.00.
  saldo: ()=>`
    <rect width="480" height="270" fill="#0b0c0f"/>${luzEscena('lzSaldo', ESC.rojo, 300, 120, 200, .28)}
    <rect x="236" y="40" width="128" height="200" rx="14" fill="#111317" stroke="#2a2d33" stroke-width="3"/>
    <rect x="246" y="58" width="108" height="164" rx="4" fill="#1a0c0c"/>
    <text x="300" y="98" text-anchor="middle" font-family="monospace" font-size="11" fill="#bdb6a8">SALDO DISPONIBLE</text>
    <text x="300" y="132" text-anchor="middle" font-family="monospace" font-weight="700" font-size="24" fill="${ESC.rojo}">$0.00</text>
    <rect x="262" y="160" width="76" height="4" fill="#3a1b1b"/><rect x="262" y="172" width="56" height="4" fill="#3a1b1b"/>
    ${siluetaProtagonista(120, 300, 2.4, 'espalda', ESC.rojo)}`,
  // Día 143: la carta de desalojo entra por debajo de la puerta.
  desalojo: ()=>`
    <rect width="480" height="270" fill="#0e1014"/><rect y="226" width="480" height="44" fill="#08090b"/>
    <rect x="170" y="30" width="150" height="196" fill="#1a1d22" stroke="#262a31" stroke-width="4"/><circle cx="296" cy="132" r="5" fill="#3a3f48"/>
    <rect x="170" y="222" width="150" height="5" fill="${ESC.ambar}" opacity=".85"/>${luzEscena('lzPuerta', ESC.ambar, 245, 228, 140, .25)}
    <polygon points="206,236 268,232 276,250 212,256" fill="${ESC.hueso}"/><text x="240" y="250" text-anchor="middle" transform="rotate(-4 240 248)" font-family="monospace" font-weight="700" font-size="8" fill="${ESC.rojo}">DESALOJO</text>
    ${siluetaProtagonista(395, 268, 1.7, 'pie', ESC.ambar)}`,
  // El sistema no te va a salvar: una ciudad entera que no te mira.
  ciudad: ()=>`
    <rect width="480" height="270" fill="#0a0d14"/>${luzEscena('lzCiudad', '#3a4a6a', 240, 270, 260, .5)}
    ${[[20,120,50,150],[78,90,40,180],[126,60,56,210],[190,105,44,165],[242,40,70,230],[320,95,48,175],[376,70,60,200],[442,115,40,155]].map(([x,y,w,h],i)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#10141c"/>${ventanasEdificio(x,y,w,h,97+i*31,ESC.ambar)}`).join('')}
    <rect y="236" width="480" height="34" fill="#06070a"/>${siluetaProtagonista(240, 240, .55, 'pie', '#7d9bff')}`,
  // Pero entiendes los números: una lámpara, papeles y una línea que sube.
  numeros: ()=>`
    <rect width="480" height="270" fill="#0c0d10"/>${luzEscena('lzLampara', ESC.ambar, 300, 120, 190, .4)}
    <polygon points="286,70 314,70 360,190 240,190" fill="${ESC.ambar}" opacity=".08"/><polygon points="292,60 308,60 316,72 284,72" fill="#2a2d33"/><line x1="300" y1="0" x2="300" y2="60" stroke="#2a2d33" stroke-width="2"/>
    <rect x="150" y="190" width="300" height="12" fill="#1b1e24"/><rect x="160" y="202" width="10" height="68" fill="#15171b"/><rect x="430" y="202" width="10" height="68" fill="#15171b"/>
    <polygon points="250,178 350,170 356,188 254,192" fill="${ESC.hueso}" opacity=".9"/>
    <polyline points="262,184 280,181 296,182 312,176 330,174 346,169" fill="none" stroke="${ESC.verde}" stroke-width="2.4"/>
    ${siluetaProtagonista(196, 192, 1.15, 'sentado')}`,
  // Si vas a caer, que sea construyendo un imperio: una torre enorme y alguien pequeño frente a ella.
  imperio: ()=>`
    <rect width="480" height="270" fill="#0b0b0e"/><rect y="150" width="480" height="30" fill="${ESC.rojo}" opacity=".14"/>${luzEscena('lzImperio', ESC.rojo, 240, 175, 260, .3)}
    <polygon points="196,250 214,40 266,40 284,250" fill="#13151a"/>${ventanasEdificio(212,52,56,190,4242,ESC.ambar)}<rect x="236" y="20" width="8" height="22" fill="#13151a"/><circle cx="240" cy="18" r="3" fill="${ESC.rojo}"/>
    <rect y="250" width="480" height="20" fill="#060607"/>${siluetaProtagonista(240, 262, .7)}`,
  // La terminal de El Comité se enciende.
  terminal: ()=>`
    <rect width="480" height="270" fill="#08090b"/>${luzEscena('lzTerminal', ESC.ambar, 240, 110, 230, .35)}
    <rect x="140" y="30" width="200" height="150" rx="10" fill="#1b1e24" stroke="#2a2d33" stroke-width="4"/><rect x="156" y="44" width="168" height="118" rx="6" fill="#0d0b05"/>
    <text x="240" y="98" text-anchor="middle" font-family="monospace" font-weight="700" font-size="18" fill="${ESC.ambar}">EL COMITÉ</text>
    <text x="240" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="${ESC.ambar}" opacity=".7">&gt; ACCESO CONCEDIDO_</text>
    <rect x="214" y="180" width="52" height="18" fill="#15171b"/><rect x="150" y="198" width="180" height="8" fill="#15171b"/>
    ${siluetaProtagonista(240, 300, 2.2, 'espalda')}`,
  // Tu empresa: la fachada con el letrero, del color de su sector.
  empresa: ()=>{
    const color = (typeof SECTOR_COLOR !== 'undefined' && sectorActual && SECTOR_COLOR[sectorActual.id]) || ESC.ambar;
    const nombre = escaparEscena(sectorActual ? nombreEmpresaActual() : 'Tu empresa').toUpperCase();
    return `<rect width="480" height="270" fill="#0b0c0f"/>${luzEscena('lzEmpresa', color, 240, 80, 220, .3)}
      <rect x="90" y="70" width="300" height="170" fill="#14161b"/>${ventanasEdificio(96,110,290,120,777,color)}
      <rect x="110" y="56" width="260" height="36" fill="${ESC.fondo}" stroke="${color}" stroke-width="3"/>
      <text x="240" y="80" text-anchor="middle" font-family="monospace" font-weight="700" font-size="${nombre.length > 22 ? 11 : 14}" fill="${color}">${nombre}</text>
      <rect x="214" y="190" width="52" height="50" fill="#0a0b0d" stroke="${color}" stroke-width="2"/>
      <rect y="240" width="480" height="30" fill="#07080a"/>${siluetaProtagonista(240, 262, .85, 'pie', color)}`;
  },
  // Lo que heredas: un retrato viejo de la gestión anterior.
  legado: ()=>`
    <rect width="480" height="270" fill="#0c0d10"/>${luzEscena('lzLegado', ESC.ambar, 240, 120, 200, .25)}
    <rect x="170" y="36" width="140" height="180" fill="#2a2116" stroke="#5a4628" stroke-width="8"/><rect x="186" y="52" width="108" height="148" fill="#3b2f1f"/>
    ${siluetaProtagonista(240, 196, .95, 'pie', '#c9a961')}
    <rect x="196" y="224" width="88" height="14" fill="#1b1e24"/><text x="240" y="234" text-anchor="middle" font-family="monospace" font-size="8" fill="#c9a961">GESTIÓN ANTERIOR</text>`,
  // Antes de entrar: el espejo, la corbata, el perfil que decidiste ser.
  perfil: ()=>`
    <rect width="480" height="270" fill="#0d0e11"/>${luzEscena('lzEspejo', ESC.hueso, 300, 110, 180, .18)}
    <rect x="250" y="30" width="120" height="190" fill="#1d2027" stroke="#2f333b" stroke-width="6"/><rect x="260" y="40" width="100" height="170" fill="#262a33"/>
    <g opacity=".55">${siluetaProtagonista(310, 220, 1.2, 'pie', ESC.hueso)}</g>
    ${siluetaProtagonista(150, 280, 1.85, 'pie', ESC.hueso)}<polygon points="146,103 154,103 157,135 150,142 143,135" fill="${ESC.rojo}" transform="translate(4,16)"/>`,
  // La junta: la imagen de El Comité, como un recuerdo.
  junta: ()=>`<image href="${COMITE_IMG_BASE64}" x="0" y="0" width="480" height="270" preserveAspectRatio="xMidYMid slice"/>`,
  // Cierre del año fiscal: el calendario tachado hasta el último día.
  calendario: ()=>`
    <rect width="480" height="270" fill="#0c0d10"/>${luzEscena('lzCal', ESC.hueso, 240, 120, 220, .14)}
    <rect x="130" y="30" width="220" height="200" fill="${ESC.hueso}"/><rect x="130" y="30" width="220" height="36" fill="${ESC.rojo}"/>
    <text x="240" y="54" text-anchor="middle" font-family="monospace" font-weight="700" font-size="14" fill="${ESC.fondo}">AÑO FISCAL</text>
    ${Array.from({length:20},(_, i)=>{ const x = 144 + (i % 5) * 40, y = 80 + Math.floor(i / 5) * 36;
      return `<text x="${x+12}" y="${y+16}" text-anchor="middle" font-family="monospace" font-size="11" fill="#3a3f48">${i+1}</text>` +
        (i < 19 ? `<line x1="${x+2}" y1="${y+4}" x2="${x+24}" y2="${y+22}" stroke="${ESC.rojo}" stroke-width="2.4"/>` : `<circle cx="${x+12}" cy="${y+12}" r="13" fill="none" stroke="${ESC.ambar}" stroke-width="3"/>`); }).join('')}`,
  // A puerta cerrada: la sala de juntas y la luz por debajo de la puerta.
  puerta: ()=>`
    <rect width="480" height="270" fill="#0b0c0e"/><rect y="226" width="480" height="44" fill="#070809"/>
    <rect x="150" y="34" width="180" height="192" fill="#1a1712" stroke="#2b261d" stroke-width="5"/><line x1="240" y1="34" x2="240" y2="226" stroke="#2b261d" stroke-width="4"/>
    <circle cx="230" cy="136" r="4" fill="#5a4628"/><circle cx="250" cy="136" r="4" fill="#5a4628"/>
    <rect x="196" y="52" width="88" height="20" fill="#0c0e11" stroke="#5a4628"/><text x="240" y="66" text-anchor="middle" font-family="monospace" font-size="8" fill="#c9a961">SALA DE JUNTAS</text>
    <rect x="150" y="222" width="180" height="5" fill="${ESC.ambar}"/>${luzEscena('lzJunta', ESC.ambar, 240, 228, 160, .3)}
    ${siluetaProtagonista(76, 262, 1.25)}`,
  // Tu gestión, turno por turno: tu propia curva de caja, impresa.
  gestion: ()=>{
    const pts = (state && state.healthHistory && state.healthHistory.length > 1) ? state.healthHistory.map(p=>p.caja) : [30, 34, 31, 38, 35, 42, 40];
    const min = Math.min(...pts), max = Math.max(...pts), rango = (max - min) || 1;
    const linea = pts.map((v, i)=>`${160 + i * (180 / Math.max(1, pts.length - 1))},${190 - (v - min) / rango * 110}`).join(' ');
    const sube = pts[pts.length - 1] >= pts[0];
    return `<rect width="480" height="270" fill="#0c0d10"/>${luzEscena('lzGestion', ESC.hueso, 250, 130, 220, .16)}
      <polygon points="140,40 360,30 372,226 150,236" fill="${ESC.hueso}"/>
      <polyline points="${linea}" fill="none" stroke="${sube ? ESC.verde : ESC.rojo}" stroke-width="3" transform="rotate(-2 250 130)"/>
      <text x="170" y="62" font-family="monospace" font-weight="700" font-size="11" fill="#3a3f48" transform="rotate(-2 250 130)">CAJA · TURNO POR TURNO</text>
      ${siluetaProtagonista(430, 300, 2, 'espalda')}`;
  },
  // El veredicto: la junta frente a ti, bajo una sola luz.
  veredicto: ()=>`
    <rect width="480" height="270" fill="#08090b"/>${luzEscena('lzVeredicto', ESC.hueso, 240, 40, 210, .25)}
    <polygon points="232,0 248,0 330,270 150,270" fill="${ESC.hueso}" opacity=".05"/>
    ${[100,160,220,280,340].map((x, i)=>siluetaProtagonista(x + 20, 150, .62, 'pie', i === 2 ? ESC.ambar : '#3a3f48').replace(new RegExp(ESC.sombra, 'g'), '#0e1013')).join('')}
    <rect x="80" y="128" width="320" height="26" fill="#1b1712"/><rect x="80" y="154" width="320" height="8" fill="#120f0b"/>
    ${siluetaProtagonista(240, 280, 1.55, 'espalda', ESC.hueso)}`
};
let escenaActual = null;
function mostrarEscenaCinematica(nombre){
  const cont = document.getElementById('introEscena');
  if(!cont) return;
  if(!nombre || !ESCENAS[nombre]){ escenaActual = null; cont.classList.remove('visible'); return; }
  if(nombre === escenaActual) return;
  escenaActual = nombre;
  let svg = '';
  try{ svg = ESCENAS[nombre](); }catch(e){ svg = ''; }
  cont.innerHTML = `<svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${svg}</svg><div class="escena-grano"></div>`;
  cont.classList.remove('visible', 'entra'); void cont.offsetWidth; cont.classList.add('visible', 'entra');
}
