export {};

type CompuestoNeumatico = 'Soft' | 'Medium' | 'Hard' | 'Intermediate' | 'FullWet';
type EstadoParadaBox = 'Ejecutada' | 'Programada' | 'Penalizada' | 'Cancelada';

interface RegistroPitStop {
  readonly paradaId: string;
  readonly piloto: string;
  readonly escuderia: string;
  readonly vueltaEntrada: number;
  readonly compuestoNuevo: CompuestoNeumatico;
  readonly tiempoDetencionSegundos: number;
  readonly desgastePrevioPct: number;
  readonly penalizacionSegundos: number;
  estado: EstadoParadaBox;
}

interface ResumenEstrategiaPitStop {
  readonly identificador: string;
  readonly pilotoYEquipo: string;
  readonly vuelta: number;
  readonly neumaticoMontado: CompuestoNeumatico;
  readonly tiempoTotalEnBoxesSeg: number;
  readonly evaluacionEjecucion: string;
}

const telemetriaBoxesGranPremio: readonly RegistroPitStop[] = [
  {
    paradaId: "PIT-501",
    piloto: "Tazio Moretti",
    escuderia: "Scuderia Valquiria",
    vueltaEntrada: 18,
    compuestoNuevo: "Hard",
    tiempoDetencionSegundos: 2.15,
    desgastePrevioPct: 78.4,
    penalizacionSegundos: 0,
    estado: "Ejecutada",
  },
  {
    paradaId: "PIT-502",
    piloto: "Kaelen Vestergaard",
    escuderia: "Apex Dynamics Racing",
    vueltaEntrada: 22,
    compuestoNuevo: "Medium",
    tiempoDetencionSegundos: 2.42,
    desgastePrevioPct: 71.0,
    penalizacionSegundos: 0,
    estado: "Ejecutada",
  },
  {
    paradaId: "PIT-503",
    piloto: "Soren Lindqvist",
    escuderia: "Nordic Motorsport",
    vueltaEntrada: 31,
    compuestoNuevo: "Intermediate",
    tiempoDetencionSegundos: 2.85,
    desgastePrevioPct: 64.5,
    penalizacionSegundos: 5.0,
    estado: "Penalizada",
  },
  {
    paradaId: "PIT-504",
    piloto: "Aether Vance",
    escuderia: "Vanguard Grand Prix",
    vueltaEntrada: 44,
    compuestoNuevo: "Soft",
    tiempoDetencionSegundos: 1.98,
    desgastePrevioPct: 82.1,
    penalizacionSegundos: 0,
    estado: "Ejecutada",
  },
  {
    paradaId: "PIT-505",
    piloto: "Marisol Hincapié",
    escuderia: "Solstice Racing Team",
    vueltaEntrada: 29,
    compuestoNuevo: "Hard",
    tiempoDetencionSegundos: 2.60,
    desgastePrevioPct: 50.0,
    penalizacionSegundos: 0,
    estado: "Cancelada",
  }
];

function validarParadaBoxActiva(parada: RegistroPitStop): boolean {
  return parada.estado !== "Cancelada" && parada.vueltaEntrada > 0 && parada.tiempoDetencionSegundos > 0;
}

function calcularTiempoTotalPitLane(detencion: number, penalizacion: number): number {
  const tiempoTransitoPitLaneBase = 18.40;
  return Number((tiempoTransitoPitLaneBase + detencion + penalizacion).toFixed(2));
}

function clasificarEficienciaPitStop(detencion: number, estado: EstadoParadaBox): string {
  if (estado === "Penalizada") return "Parada Comprometida por Penalización";
  if (detencion <= 2.10) return "Récord de Precisión Mecánica";
  if (detencion <= 2.50) return "Ejecución Óptima Estándar";
  return "Parada Lenta (Margen de Mejora)";
}

function procesarEstrategiaPitStop(paradas: readonly RegistroPitStop[]): readonly ResumenEstrategiaPitStop[] {
  return paradas
    .filter(validarParadaBoxActiva)
    .map(parada => {
      const tiempoTotal = calcularTiempoTotalPitLane(parada.tiempoDetencionSegundos, parada.penalizacionSegundos);
      return {
        identificador: parada.paradaId,
        pilotoYEquipo: `${parada.piloto} (${parada.escuderia})`,
        vuelta: parada.vueltaEntrada,
        neumaticoMontado: parada.compuestoNuevo,
        tiempoTotalEnBoxesSeg: tiempoTotal,
        evaluacionEjecucion: clasificarEficienciaPitStop(parada.tiempoDetencionSegundos, parada.estado),
      };
    })
    .sort((a, b) => a.tiempoTotalEnBoxesSeg - b.tiempoTotalEnBoxesSeg);
}

function imprimirReportePitStop(titulo: string, resumen: readonly ResumenEstrategiaPitStop[]): void {
  console.log(`=== [ESTRATEGIA DE PIT STOP] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificador}] ${item.pilotoYEquipo} | Vuelta: ${item.vuelta} | Compuesto: ${item.neumaticoMontado} | Tiempo Total Pit Lane: ${item.tiempoTotalEnBoxesSeg}s | Evaluación: ${item.evaluacionEjecucion}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoPitStopOficial = procesarEstrategiaPitStop(telemetriaBoxesGranPremio);
imprimirReportePitStop("Análisis Telemetría de Paradas en Boxes", resultadoPitStopOficial);

// Caso: Parada de emergencia bajo lluvia torrencial con cambio de alerón delantero y sanción Stop & Go
const paradaCasoLimite: readonly RegistroPitStop[] = [
  {
    paradaId: "PIT-9999",
    piloto: "Gaelen Thorne",
    escuderia: "Titan F1 Engineering",
    vueltaEntrada: 52,
    compuestoNuevo: "FullWet",
    tiempoDetencionSegundos: 11.45,
    desgastePrevioPct: 96.8,
    penalizacionSegundos: 10.0,
    estado: "Penalizada",
  }
];

const resultadoLimite = procesarEstrategiaPitStop(paradaCasoLimite);
imprimirReportePitStop("Caso: Parada Crítica con Cambio de Alerón y Penalización", resultadoLimite);