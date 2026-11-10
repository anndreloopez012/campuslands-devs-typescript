export {};

type EstadoLote = "Abierto" | "Martillado Adjudicado" | "No Alcanzo Reserva";

interface Puja {
  readonly postorId: string;
  readonly montoUsd: number;
  readonly timestamp: string;
}

interface LoteSubasta {
  readonly numeroLote: number;
  readonly vehiculo: string;
  readonly precioReservaUsd: number;
  readonly pujaActualUsd: number;
  readonly historialPujas: readonly Puja[];
  readonly estado: EstadoLote;
}

interface ResultadoCierreLote {
  readonly lote: number;
  readonly vehiculo: string;
  readonly precioFinalUsd: number;
  readonly postorGanador: string;
  readonly estadoFinal: EstadoLote;
}

function cerrarLoteSubasta(lote: LoteSubasta): ResultadoCierreLote {
  const mayorPuja = [...lote.historialPujas].sort((a, b) => b.montoUsd - a.montoUsd)[0];

  if (!mayorPuja || mayorPuja.montoUsd < lote.precioReservaUsd) {
    return {
      lote: lote.numeroLote,
      vehiculo: lote.vehiculo,
      precioFinalUsd: mayorPuja ? mayorPuja.montoUsd : 0,
      postorGanador: "Sin adjudicar",
      estadoFinal: "No Alcanzo Reserva",
    };
  }

  return {
    lote: lote.numeroLote,
    vehiculo: lote.vehiculo,
    precioFinalUsd: mayorPuja.montoUsd,
    postorGanador: mayorPuja.postorId,
    estadoFinal: "Martillado Adjudicado",
  };
}

const loteFerrari: LoteSubasta = {
  numeroLote: 42,
  vehiculo: "Ferrari F40 1991 Rosso Corsa",
  precioReservaUsd: 2200000,
  pujaActualUsd: 2450000,
  historialPujas: [
    { postorId: "Collector_88", montoUsd: 2100000, timestamp: "18:02" },
    { postorId: "VIP_Monaco", montoUsd: 2300000, timestamp: "18:05" },
    { postorId: "GenevaVault", montoUsd: 2450000, timestamp: "18:09" },
  ],
  estado: "Abierto",
};

console.log("=== SUBASTA DE AUTOS DE COLECCION Y LUJO ===");
const adjudicacion = cerrarLoteSubasta(loteFerrari);
console.log(`Lote #${adjudicacion.lote}: ${adjudicacion.vehiculo}`);
console.log(`Martillado en: $${adjudicacion.precioFinalUsd.toLocaleString()} USD`);
console.log(`Ganador: ${adjudicacion.postorGanador} | Veredicto: ${adjudicacion.estadoFinal}`);