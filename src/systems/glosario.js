/* =========================================================
   GLOSARIO FINANCIERO COMPARTIDO — resalta automáticamente la primera
   aparición de cada término dentro del contexto y las opciones de un caso,
   reutilizando el mismo sistema de tooltip que ya usan los indicadores.
   No revela el impacto de ninguna decisión — solo explica el concepto
   para que el jugador pueda razonar con la información, no adivinar.
   ========================================================= */
const GLOSARIO_FINANCIERO = {
  capex: {titulo:"CAPEX / inversión de capital", patron:"capex", def:"Dinero destinado a comprar o mejorar activos de largo plazo (maquinaria, equipos, infraestructura). A diferencia de un gasto operativo, no se consume en el mismo periodo: queda como un activo en el balance y su beneficio se extiende por varios años."},
  factoring: {titulo:"Factoring", patron:"factoring", def:"Vender tu cartera de cuentas por cobrar a un tercero, a cambio de un descuento sobre el valor total, para recibir el efectivo de inmediato en vez de esperar a que tus clientes paguen en la fecha pactada."},
  ventureDebt: {titulo:"Venture debt", patron:"venture debt", def:"Deuda diseñada para empresas en crecimiento que todavía no generan utilidades estables, respaldada por inversionistas existentes en vez de garantías tradicionales — suele incluir opciones (warrants) a favor del prestamista."},
  rondaAngel: {titulo:"Ronda de inversión ángel", patron:"inversi[oó]n [aá]ngel|ronda ángel|inversionista[s]? [aá]ngel", def:"Capital aportado por un inversionista individual (no un fondo institucional) a una empresa en etapa temprana, generalmente a cambio de una participación accionaria."},
  equity: {titulo:"Participación accionaria (equity)", patron:"participaci[oó]n accionaria|participaci[oó]n minoritaria|ceder (?:un )?\\d+% de (?:la empresa|participaci[oó]n)", def:"Un porcentaje de la propiedad de la empresa. Ceder participación no genera deuda ni intereses, pero sí reparte las utilidades futuras y el poder de decisión con quien la recibe."},
  certificacionOrganica: {titulo:"Certificación orgánica", patron:"certificaci[oó]n org[aá]nica", def:"Sello otorgado por una entidad externa que verifica que un producto se cultivó o produjo sin ciertos químicos sintéticos. Suele exigir procesos más costosos, pero permite acceder a mercados que pagan sobreprecio por ella."},
  creditoSindicado: {titulo:"Crédito sindicado", patron:"cr[eé]dito sindicado", def:"Un préstamo grande otorgado conjuntamente por varios bancos en vez de uno solo, lo que reparte el riesgo entre ellos y suele permitir montos mayores a los que un solo banco prestaría por su cuenta."},
  plazoDeGracia: {titulo:"Plazo de gracia", patron:"plazo de gracia", def:"Un periodo pactado al inicio de un crédito durante el cual no se exige pagar capital, o a veces ni siquiera intereses — alivia la caja al principio, aunque generalmente extiende el costo total de la deuda."},
  aval: {titulo:"Aval / garantía", patron:"aval|garant[ií]a hipotecaria|garant[ií]as exigidas", def:"Un respaldo (un bien, una firma adicional, un activo) que reduce el riesgo del prestamista si tú no pagas. A cambio de dar más garantías, normalmente se consiguen mejores condiciones de tasa."},
  centralRiesgo: {titulo:"Central de riesgo", patron:"central de riesgo", def:"Una base de datos que registra el historial crediticio de personas y empresas — cuánto deben, con quién, y si han pagado a tiempo. Bancos y proveedores la consultan antes de dar crédito o plazo."},
  marginCall: {titulo:"Margin call", patron:"margin call", def:"Una exigencia de pago o cobertura forzosa cuando el precio de un activo se mueve en tu contra y ya no tienes suficiente garantía cubriendo la posición — si no reaccionas a tiempo, la operación se liquida automáticamente al peor precio disponible."},
  exclusividad: {titulo:"Exclusividad comercial", patron:"exclusividad|proveedor exclusivo|comprador exclusivo", def:"Un compromiso de venderle (o comprarle) solo a una contraparte específica, renunciando a hacer negocios equivalentes con cualquier otra — a cambio, suele venir con mejores condiciones de precio o volumen garantizado."},
  comiteAsesor: {titulo:"Comité asesor / puesto asesor", patron:"comit[eé] asesor|puesto asesor", def:"Un grupo de personas externas a la operación diaria, con voz (aunque no siempre voto) sobre decisiones estratégicas importantes. Ceder un puesto ahí suele ser condición de los inversionistas a cambio de su capital."},
  trm: {titulo:"TRM / tipo de cambio", patron:"tipo de cambio|TRM\\b", def:"La tasa a la que se convierte una moneda en otra. Cuando el peso se devalúa frente al dólar, quien exporta gana más pesos por cada dólar vendido, y quien importa paga más pesos por lo mismo."},
  commodity: {titulo:"Commodity", patron:"commodity|commodities", def:"Un bien básico y estandarizado (café, leche, acero, petróleo) cuyo precio se fija principalmente en mercados internacionales, no por la marca o el vendedor individual — por eso su precio sube y baja según la oferta y demanda global, no según lo que tú decidas."},
  cadenaFrio: {titulo:"Cadena de frío", patron:"cadena de fr[ií]o", def:"El conjunto de condiciones de refrigeración continua que un producto perecedero necesita desde que se produce hasta que se vende — si se rompe en cualquier punto, el producto se daña, aunque el resto de la cadena haya funcionado bien."},
  outsourcing: {titulo:"Outsourcing", patron:"outsourcing|tercerizaci[oó]n", def:"Contratar a una empresa externa para que realice una función que normalmente harías con personal propio (contabilidad, soporte, logística) — suele reducir costos fijos, a cambio de perder control directo sobre esa función."},
  deudaSubordinada: {titulo:"Deuda subordinada", patron:"deuda subordinada", def:"Deuda que, en caso de que la empresa no pueda pagar a todos sus acreedores, se paga después de la deuda principal (\"senior\") — por ese mayor riesgo, suele tener una tasa de interés más alta."},
  creditoPuente: {titulo:"Crédito puente", patron:"cr[eé]dito puente|adelanto de caja", def:"Financiamiento de corto plazo pensado para cubrir un vacío temporal de liquidez, mientras llega un ingreso ya esperado o se concreta una fuente de capital más permanente."},
  valoracionEmpresa: {titulo:"Valoración de empresa", patron:"valoraci[oó]n (?:independiente|de la empresa)|valorar la empresa", def:"Una estimación técnica de cuánto vale una empresa en su totalidad, generalmente hecha por un experto externo — sirve como referencia antes de vender una participación, para no ceder propiedad por menos de lo que realmente vale."},
  arancel: {titulo:"Arancel", patron:"arancel(?:es)?", def:"Un impuesto que se cobra sobre bienes que cruzan una frontera (al importar o exportar). Subir un arancel encarece lo importado, favoreciendo a los productores locales del mismo bien — pero también puede encarecer insumos importados que ese mismo productor necesita."},
  duediligence: {titulo:"Diligencia debida (due diligence)", patron:"diligencia debida|due diligence", def:"Una investigación exhaustiva de los números, contratos y riesgos reales de una empresa u operación, hecha antes de cerrar una inversión, compra o alianza importante — busca confirmar que lo que se promete coincide con lo que hay."},
  capitalizar: {titulo:"Capitalizar", patron:"capitalizar|capitalizaci[oó]n", def:"Convertir un desembolso (como una deuda que se perdona, o un gasto que se reclasifica) en un aumento del patrimonio o de un activo de la empresa, en vez de dejarlo como un costo del periodo."},
  primaSeguro: {titulo:"Prima de seguro", patron:"prima(?:s)? (?:del seguro|de la p[oó]liza)", def:"El pago periódico que se hace a una aseguradora para mantener una cobertura activa — a cambio, la aseguradora asume el costo si ocurre el evento cubierto (un siniestro, un incumplimiento, un desastre climático)."},
  poliza: {titulo:"Póliza", patron:"p[oó]liza(?:s)?", def:"El contrato formal con una aseguradora que define exactamente qué está cubierto, hasta qué monto, y bajo qué condiciones — leerla con cuidado importa tanto como pagarla."},
  factorajeInverso: {titulo:"Carta de crédito", patron:"carta de cr[eé]dito", def:"Una garantía emitida por un banco a nombre de tu empresa, que asegura a un proveedor o contraparte que va a recibir el pago aunque tú no puedas cubrirlo directamente en ese momento — el banco responde primero, y luego te cobra a ti."},
  fee: {titulo:"Fee", patron:"fee(?:s)?", def:"Una comisión u honorario que se paga por un servicio profesional (asesoría, gestión, diagnóstico), no por comprar un producto físico — es el término que se usa casi siempre en banca de inversión, consultoría y fondos, incluso hablando en español."},
  leasing: {titulo:"Leasing financiero", patron:"leasing", def:"Una forma de financiar un activo (un vehículo, una máquina) pagando cuotas periódicas por usarlo, en vez de comprarlo de contado — al final del contrato, dependiendo del tipo de leasing, puedes quedarte con el activo o devolverlo."},
  startupTermino: {titulo:"Startup", patron:"startup(?:s)?", def:"Una empresa en etapa muy temprana, generalmente tecnológica, diseñada para crecer muy rápido — suele operar con pérdidas al principio a cambio de capital externo, apostando a que el crecimiento futuro compense el riesgo de hoy."},
  apalancamiento: {titulo:"Apalancamiento", patron:"apalancamiento", def:"Usar deuda para financiar una operación o inversión en vez de solo capital propio — amplifica tanto las ganancias como las pérdidas: si el negocio va bien, la deuda multiplica tu retorno; si va mal, multiplica tu problema."},
  fiduciaria: {titulo:"Fiduciaria / fideicomiso", patron:"fiduciari[ao]|fideicomiso", def:"Una entidad (o un contrato) que administra un activo, un pago o un riesgo por cuenta de otro, siguiendo reglas ya pactadas — permite que un tercero de confianza gestione algo delicado sin que tú tengas que hacerlo directamente."},
  puntoEquilibrio: {titulo:"Punto de equilibrio", patron:"punto de equilibrio", def:"El nivel de ventas o de ingresos en el que una empresa deja de perder dinero, pero tampoco gana — todo lo que se vende por encima de ese punto empieza a ser utilidad real; todo lo que se vende por debajo, todavía no cubre los costos fijos."}
};
const GLOSARIO_TERMINOS_ORDENADOS = Object.keys(GLOSARIO_FINANCIERO)
  .map(id=>({id, patron:GLOSARIO_FINANCIERO[id].patron}))
  .sort((a,b)=>b.patron.length-a.patron.length);

function resaltarGlosario(texto){
  if(!texto) return texto;
  const partes = String(texto).split(/(<[^>]+>)/g); // separa por tags HTML, sin tocar su contenido
  const usados = new Set();
  for(let i=0;i<partes.length;i++){
    if(i % 2 === 1) continue; // es un tag HTML, no un segmento de texto
    let segmento = partes[i];
    for(const term of GLOSARIO_TERMINOS_ORDENADOS){
      if(usados.has(term.id)) continue;
      let regex;
      try{ regex = new RegExp('\\b(' + term.patron + ')\\b', 'i'); } catch(e){ continue; }
      if(regex.test(segmento)){
        segmento = segmento.replace(regex, (match)=>`<span class="glosario-term" data-tip="glosario:${term.id}">${match}</span>`);
        usados.add(term.id);
      }
    }
    partes[i] = segmento;
  }
  return partes.join('');
}

function getTooltipHTML(key){
  if(KPI_INFO[key]){
    const info = KPI_INFO[key];
    const u = sectorActual && sectorActual.umbrales && sectorActual.umbrales[key];
    const rango = (u && u.rango) || info.rango;
    return `<b>${KPI_LABEL[key]||key}</b>${info.def}<div class="rango">Rango saludable: ${rango}</div>`;
  }
  if(key.indexOf('sector:')===0){
    const s = SECTORS.find(x=>x.id===key.slice(7));
    return s ? `<b>${s.nombre}</b>${s.descripcion}` : '';
  }
  if(key.indexOf('profile:')===0){
    const p = PERFILES.find(x=>x.id===key.slice(8));
    return p ? `<b>${p.nombre}</b>${p.descripcion}` : '';
  }
  if(key.indexOf('perk:')===0){
    const p = PERKS.find(x=>x.id===key.slice(5));
    return p ? `<b>${p.nombre}</b>${p.descripcion}` : '';
  }
  if(key.indexOf('dificultad:')===0){
    const d = DIFICULTADES.find(x=>x.id===key.slice(11));
    return d ? `<b>${d.nombre}</b>${d.descripcion}` : '';
  }
  if(key.indexOf('glosario:')===0){
    const term = GLOSARIO_FINANCIERO[key.slice(9)];
    return term ? `<b>${term.titulo}</b>${term.def}` : '';
  }
  return '';
}

function positionTooltip(trigger, tip){
  const rect = trigger.getBoundingClientRect();
  const margin = 10;
  const naturalWidth = tip.offsetWidth || 215;
  const tipWidth = Math.min(naturalWidth, window.innerWidth - margin*2);
  tip.style.width = tipWidth + 'px';
  let left = rect.left + rect.width/2 - tipWidth/2;
  left = Math.max(margin, Math.min(left, window.innerWidth - tipWidth - margin));
  let top = rect.bottom + 8;
  const tipHeight = tip.offsetHeight || 100;
  if(top + tipHeight > window.innerHeight - margin){
    top = rect.top - tipHeight - 8;
    if(top < margin) top = margin;
  }
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
}

function toggleSharedTooltip(triggerEl, key){
  const tip = document.getElementById('sharedTooltip');
  if(tooltipAbiertoKey === key && tip.classList.contains('show')){
    tip.classList.remove('show');
    tooltipAbiertoKey = null;
    return;
  }
  tip.innerHTML = getTooltipHTML(key);
  tip.classList.add('show');
  tooltipAbiertoKey = key;
  positionTooltip(triggerEl, tip);
}

function closeSharedTooltip(){
  const tip = document.getElementById('sharedTooltip');
  if(tip) tip.classList.remove('show');
  tooltipAbiertoKey = null;
}

document.addEventListener('click', (e)=>{
  const trigger = e.target.closest('[data-tip]');
  if(trigger){
    e.stopPropagation();
    toggleSharedTooltip(trigger, trigger.getAttribute('data-tip'));
  } else {
    closeSharedTooltip();
  }
});

function relChip(label, val, key, warnTxt){
  const pill = statusPill(val);
  const critical = pill.tier === 'critico';
  const colorBarra = {optimo:'var(--teal)', estable:'#7FADD9', riesgo:'#E0A93A', critico:'var(--danger)'}[pill.tier];
  const pct = clamp(val, 0, 100);
  return `<div class="rel-chip tier-${pill.tier} ${critical?'critical':''}" data-tip="${key}">
    <span class="rel-label">${label} ${tendenciaHTML(key)}</span>
    <span class="status-pill ${pill.tier}">[${pill.label}]</span>
    <div class="rel-bar-track"><div class="rel-bar-fill" style="width:${pct}%; background:${colorBarra};"></div></div>
    ${critical?`<span class="rel-warn">⚠ ${warnTxt}</span>`:''}
  </div>`;
}

