/* =========================================================
   ICONOS DE KPI — insignia de color + glifo de línea
   ========================================================= */
const KPI_ICON_COLOR = {
  caja: '#4F9D8D',
  capitalTrabajo: '#7C6FBE',
  razonCorriente: '#C9A961',
  deuda: '#C1452D',
  ebitda: '#39C46A',
  wacc: '#E0A93A',
  diasInventario: '#D4A24C',
  diasCartera: '#4FA3D1',
  valorInventario: '#C97C3A',
  cce: '#C874C2'
};
const KPI_ICON_GLYPH = {
  // Caja: caja fuerte / bóveda
  caja: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><line x1="12" y1="8.5" x2="12" y2="6.5"/><line x1="7" y1="4" x2="7" y2="1.5"/><line x1="17" y1="4" x2="17" y2="1.5"/>',
  // Capital de trabajo: barras ascendentes
  capitalTrabajo: '<rect x="3.5" y="13" width="3.5" height="7" fill="currentColor" stroke="none"/><rect x="10.2" y="9" width="3.5" height="11" fill="currentColor" stroke="none"/><rect x="17" y="5" width="3.5" height="15" fill="currentColor" stroke="none"/>',
  // Razón corriente: balanza
  razonCorriente: '<line x1="12" y1="3" x2="12" y2="20"/><line x1="5" y1="7" x2="19" y2="7"/><line x1="8.5" y1="20" x2="15.5" y2="20"/><path d="M5 7 L2 13.5 A4 4 0 0 0 8 13.5 Z"/><path d="M19 7 L16 13.5 A4 4 0 0 0 22 13.5 Z"/>',
  // Endeudamiento: candado
  deuda: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11 V7.5 a4 4 0 0 1 8 0 V11"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/>',
  // EBITDA: barras + flecha
  ebitda: '<rect x="3" y="14" width="3" height="6" fill="currentColor" stroke="none"/><rect x="8" y="10" width="3" height="10" fill="currentColor" stroke="none"/><rect x="13" y="6" width="3" height="14" fill="currentColor" stroke="none"/><path d="M14 3 H21 V10"/><line x1="21" y1="3" x2="13" y2="11"/>',
  // WACC: velocímetro / gauge
  wacc: '<path d="M4 16 A8 8 0 0 1 20 16"/><line x1="12" y1="16" x2="15.5" y2="10.5"/><circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none"/>',
  // Días de inventario: reloj
  diasInventario: '<circle cx="12" cy="12" r="8.5"/><line x1="12" y1="12" x2="12" y2="7.3"/><line x1="12" y1="12" x2="15.5" y2="14"/>',
  // Días de cartera (DSO): factura con reloj
  diasCartera: '<rect x="4" y="3.5" width="12" height="16" rx="1.2"/><line x1="7" y1="7.5" x2="13" y2="7.5"/><line x1="7" y1="10.5" x2="13" y2="10.5"/><line x1="7" y1="13.5" x2="10" y2="13.5"/><circle cx="17" cy="17" r="5" fill="var(--bg-panel)"/><line x1="17" y1="17" x2="17" y2="14.3"/><line x1="17" y1="17" x2="19.1" y2="18.3"/>',
  // Valor de inventario: cajas apiladas + valor
  valorInventario: '<rect x="3.5" y="11" width="7" height="8" fill="currentColor" stroke="none"/><rect x="12.5" y="5.5" width="8" height="13.5" fill="currentColor" stroke="none"/><text x="16.5" y="13.5" font-size="7.5" text-anchor="middle" fill="var(--bg-panel)" stroke="none" font-family="monospace" font-weight="700">$</text>',
  // Ciclo de conversión de efectivo: flecha circular (ciclo)
  cce: '<path d="M18 6 A8 8 0 1 0 20 12"/><path d="M18 2 L18 6 L22 6"/>'
};
function pixelIcon(key, size){
  const color = KPI_ICON_COLOR[key] || 'var(--gold)';
  const glyph = KPI_ICON_GLYPH[key];
  if(!glyph) return '';
  size = size || 32;
  const iconSize = Math.round(size*0.58);
  return `<div class="stat-badge" style="background:${color}22; border:2px solid ${color};">
    <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" color="${color}">${glyph}</svg>
  </div>`;
}

const KPI_DEFS = [
  {key:'caja', label:'Caja / FCF disponible', fmt:v=>fmtMoney(v), kind:'money', emoji:'💰'},
  {key:'capitalTrabajo', label:'Capital de trabajo', fmt:v=>fmtMoney(v), kind:'money', emoji:'⚖️'},
  {key:'razonCorriente', label:'Razón corriente', fmt:v=>v.toFixed(2), kind:'ratio', emoji:'📊'},
  {key:'deuda', label:'Endeudamiento', fmt:v=>fmtMoney(v), kind:'money', emoji:'🏦'},
  {key:'wacc', label:'WACC (costo de capital)', fmt:v=>v.toFixed(1)+'%', kind:'pct', emoji:'📉'},
  {key:'ebitda', label:'EBITDA acumulado', fmt:v=>fmtMoney(v), kind:'money', emoji:'📈'},
  {key:'diasCartera', label:'Días rotación cartera (DSO)', fmt:v=>Math.round(v)+' días', kind:'dias', emoji:'🧾'},
  {key:'diasInventario', label:'Días rotación inventario', fmt:v=>Math.round(v)+' días', kind:'dias', emoji:'📦'},
  {key:'valorInventario', label:'Valor de inventario', fmt:v=>fmtMoney(v), kind:'money', emoji:'🏭'}
];
const KPI_LABEL = {}; KPI_DEFS.forEach(d=>KPI_LABEL[d.key]=d.label);
KPI_LABEL.confianzaProveedores = 'Confianza de proveedores';
KPI_LABEL.confianzaBanco = 'Confianza del banco';
KPI_LABEL.reputacion = 'Reputación ante la junta';
KPI_LABEL.moralEquipo = 'Moral del equipo';

const KPI_INFO = {
  caja: {def:"El efectivo real que tu empresa tiene hoy para pagar obligaciones inmediatas — nómina, proveedores, impuestos.", rango:"suficiente para cubrir 1-2 meses de gastos operativos fijos."},
  capitalTrabajo: {def:"Activo Corriente menos Pasivo Corriente. Mide si tienes más de lo que puedes convertir en efectivo pronto que deudas que vencen pronto.", rango:"positivo y estable; si es negativo de forma sostenida, es alerta temprana de iliquidez."},
  razonCorriente: {def:"Activo Corriente ÷ Pasivo Corriente. Cuántas veces puedes cubrir tus deudas de corto plazo con tus activos líquidos.", rango:"entre 1.2 y 2.0. Por debajo de 1.0 es alerta de liquidez; muy por encima de 2.5 puede indicar activos ociosos sin usar."},
  deuda: {def:"El total de créditos y obligaciones financieras que tu empresa debe pagar, con o sin intereses.", rango:"depende del sector, pero como referencia: Deuda/EBITDA menor a 3x suele considerarse manejable."},
  ebitda: {def:"Utilidad operativa antes de intereses, impuestos, depreciación y amortización — mide qué tan rentable es el negocio en sí, sin el efecto de cómo lo financias.", rango:"positivo y creciente periodo a periodo."},
  wacc: {def:"Costo Promedio Ponderado de Capital — lo que te cuesta, en promedio, cada peso que usas para financiar la empresa (deuda + capital propio).", rango:"entre 8% y 15% es típico para una pyme en un mercado emergente; por encima de 18-20% el mercado ya te percibe como muy riesgoso."},
  diasInventario: {def:"Cuántos días, en promedio, tarda tu inventario en convertirse en venta.", rango:"entre 30 y 55 días para retail/consumo; por encima de 70-80 días el capital atrapado empieza a doler."},
  diasCartera: {def:"Días de Rotación de Cartera (DSO) — cuántos días, en promedio, tardan tus clientes en pagarte después de facturar la venta.", rango:"entre 30 y 60 días es manejable; por encima de 90 días estás financiando a tus clientes más de la cuenta con tu propio capital de trabajo."},
  valorInventario: {def:"El valor en pesos del inventario físico que tienes almacenado — mercancía, materia prima o producto terminado sin vender todavía.", rango:"debe crecer en proporción a tus ventas; si crece más rápido que lo que vendes, es capital de trabajo atrapado en la bodega."},
  cce: {def:"Ciclo de Conversión de Efectivo — cuántos días pasan, en promedio, desde que pagas por tu inventario hasta que finalmente cobras esa venta en efectivo. Se calcula como Días de Inventario + Días de Cartera − Días de Pago a Proveedores estimados. No es un número independiente: se mueve solo cuando cambian esos tres.", rango:"entre 0 y 45 días es saludable; por encima de 90 días tu operación tiene demasiado capital atrapado en el ciclo completo."},
  confianzaProveedores: {def:"Qué tan dispuestos están tus proveedores a seguir dándote plazo de pago según tu historial con ellos.", rango:"por encima de 50/100; por debajo de 25 suelen empezar a exigirte pago anticipado."},
  confianzaBanco: {def:"Qué tan bien te percibe el sistema financiero para efectos de crédito y condiciones futuras.", rango:"por encima de 50/100; por debajo de 35 tu costo de capital empieza a subir de forma automática. Ojo: demasiado alta tampoco es gratis — el banco te ofrece crédito constantemente, y esa tentación se refleja sola en tu endeudamiento."},
  reputacion: {def:"Cómo te ve la junta directiva y tus grupos de interés — un activo intangible, pero con consecuencias muy reales.", rango:"por encima de 40/100; por debajo de 15 arriesgas la destitución. Ojo: demasiado alta también cuesta — quedas bajo un escrutinio mediático constante que se traduce en gasto de relaciones públicas."},
  moralEquipo: {def:"Qué tan motivado y retenido está tu talento clave.", rango:"por encima de 45/100; por debajo de 30 empiezan las renuncias. Ojo: demasiado alta roza la complacencia — sin ninguna presión real, el ritmo de trabajo se relaja y el EBITDA lo nota."}
};
const EXPLAIN = {
  caja: "Es el efecto directo en efectivo: lo que entra o sale de la cuenta de la empresa por esta decisión.",
  capitalTrabajo: "El Capital de Trabajo (Activo Corriente − Pasivo Corriente) se mueve porque esta decisión cambia tu cartera, tu inventario o tus obligaciones de corto plazo.",
  razonCorriente: "La Razón Corriente (Activo Corriente ÷ Pasivo Corriente) mide tu capacidad de pago inmediata. Cualquier cambio en cartera, inventario o deuda de corto plazo mueve este número.",
  deuda: "Tu Endeudamiento total cambia porque esta decisión implica tomar, refinanciar o abonar una obligación financiera.",
  ebitda: "El EBITDA (utilidad operativa antes de intereses, impuestos, depreciación y amortización) cambia porque esta decisión afecta tus ingresos o tus costos operativos directos.",
  wacc: "El WACC (costo promedio ponderado de capital) sube o baja porque el mercado ajusta el precio de tu dinero según el riesgo que percibe en tu empresa.",
  diasInventario: "Mide cuánto tarda tu inventario en convertirse en venta. Comprar más stock del que rotas atrapa capital de trabajo; venderlo, liquidarlo o donarlo lo reduce.",
  diasCartera: "Mide cuántos días tardan tus clientes en pagarte. Aceptar plazos más largos o clientes que no cumplen sube este número; cobrar más rápido o exigir garantías lo baja.",
  valorInventario: "Sube cuando compras más mercancía o materia prima de la que vendes en el periodo; baja cuando liquidas, vendes o donas inventario acumulado.",
  cce: "Se recalcula automáticamente en cada turno a partir de tus Días de Inventario, tus Días de Cartera y tu relación con proveedores (que determina cuánto tiempo tienes para pagarles). No lo mueve ninguna decisión directamente — lo mueven las otras tres.",
  confianzaProveedores: "Sube o baja según cumplas o incumplas tus condiciones de pago pactadas — determina si te siguen dando plazo o te exigen pago anticipado.",
  confianzaBanco: "Se ajusta según tu comportamiento de pago y la calidad de la información financiera que entregas — determina el costo y disponibilidad de crédito futuro.",
  reputacion: "Refleja cómo te ve la junta directiva y tus grupos de interés: decisiones transparentes y balanceadas la fortalecen; los recortes despiadados o el maquillaje contable la erosionan.",
  moralEquipo: "Mide qué tan retenido y motivado está tu talento clave. Congelar salarios o recortar beneficios la reduce; invertir en retención la sube."
};

