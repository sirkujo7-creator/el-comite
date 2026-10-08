/* =========================================================================================
   PERFILES DE GERENTE Y VENTAJAS (progresión de sesión)
   ========================================================================================= */
const PERFILES = [
  { id:'negociador', nombre:'El Negociador', descripcion:'Mejores condiciones con bancos y proveedores desde el primer turno.',
    bonus:{wacc:-0.5, confianzaBanco:8, confianzaProveedores:8} },
  { id:'optimizador', nombre:'El Optimizador', descripcion:'Reduce gastos operativos fijos: arranca con mejor margen y capital de trabajo.',
    bonus:{ebitda:2, capitalTrabajo:2} },
  { id:'agresivo', nombre:'El Agresivo', descripcion:'Arranca con más caja disponible para apostar fuerte, pero con menos crédito de confianza inicial ante la junta.',
    bonus:{caja:5, reputacion:-8, wacc:0.5} }
];
const PERKS = [
  { id:'ninguna', nombre:'Sin ventaja inicial', descripcion:'Empiezas con las condiciones estándar del sector.', xpRequerido:0, bonus:{} },
  { id:'asesorFiscal', nombre:'Asesor fiscal de cabecera', descripcion:'Reduce tu costo de capital inicial (-0.5% WACC).', xpRequerido:30, bonus:{wacc:-0.5} },
  { id:'lineaAprobada', nombre:'Línea de crédito pre-aprobada', descripcion:'Arranca con más capital de trabajo y menos deuda relativa.', xpRequerido:60, bonus:{capitalTrabajo:5, deuda:-3} }
];

