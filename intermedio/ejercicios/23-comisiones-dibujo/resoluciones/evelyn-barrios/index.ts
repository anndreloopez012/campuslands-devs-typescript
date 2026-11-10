export {};

type TipoIlustracion = "Boceto" | "Retrato" | "Cuerpo Completo" | "Splash Art RPG";
type NivelFondo = "Transparente" | "Simple" | "Escenario Complejo";

interface ComisionArte {
  readonly id: string;
  readonly artista: string;
  readonly cliente: string;
  readonly tipo: TipoIlustracion;
  readonly fondo: NivelFondo;
  readonly usoComercial: boolean;
  readonly revisionesExtra: number;
}

interface CotizacionFinal {
  readonly comisionId: string;
  readonly precioBaseUsd: number;
  readonly recargoFondoUsd: number;
  readonly canonComercialUsd: number;
  readonly totalPagarUsd: number;
}

function cotizarComision(comision: ComisionArte): CotizacionFinal {
  let precioBase = 40;
  switch (comision.tipo) {
    case "Boceto": precioBase = 25; break;
    case "Retrato": precioBase = 50; break;
    case "Cuerpo Completo": precioBase = 90; break;
    case "Splash Art RPG": precioBase = 180; break;
  }

  let recargoFondo = 0;
  if (comision.fondo === "Simple") recargoFondo = 20;
  if (comision.fondo === "Escenario Complejo") recargoFondo = 60;

  const canonComercial = comision.usoComercial ? Number((precioBase * 0.5).toFixed(2)) : 0;
  const costoRevisiones = comision.revisionesExtra * 15;
  const total = precioBase + recargoFondo + canonComercial + costoRevisiones;

  return {
    comisionId: comision.id,
    precioBaseUsd: precioBase,
    recargoFondoUsd: recargoFondo,
    canonComercialUsd: canonComercial,
    totalPagarUsd: total,
  };
}

const pedidoIlustracion: ComisionArte = {
  id: "art-501",
  artista: "Kael Digital",
  cliente: "Nexus Games Studio",
  tipo: "Splash Art RPG",
  fondo: "Escenario Complejo",
  usoComercial: true,
  revisionesExtra: 2,
};

console.log("=== COTIZADOR DE COMISIONES DE DIBUJO RPG ===");
const facturaArte = cotizarComision(pedidoIlustracion);
console.log(`Solicitud: ${facturaArte.comisionId} (${pedidoIlustracion.tipo})`);
console.log(`Base: $${facturaArte.precioBaseUsd} | Fondo: $${facturaArte.recargoFondoUsd} | Licencia comercial: $${facturaArte.canonComercialUsd}`);
console.log(`Total a facturar: $${facturaArte.totalPagarUsd} USD`);