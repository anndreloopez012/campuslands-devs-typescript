export {};

type FaseTormenta = 'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase Final';
type EstadoJugadorZona = 'DentroDeZona' | 'EnLaTormenta' | 'EliminadoPorTormenta' | 'Victorioso';

interface FichaJugadorSimulacion {
  readonly jugadorId: string;
  readonly nombreJugador: string;
  readonly faseActual: FaseTormenta;
  readonly distanciaAlCentroMetros: number;
  readonly vidaActualPct: number; // Porcentaje de 0 a 100
  readonly escudosActivos: boolean;
  estado: EstadoJugadorZona;
}

interface ResumenSimulacionZona {
  readonly jugador: string;
  readonly fase: FaseTormenta;
  readonly distancia: string;
  readonly danioEstimadoPorSegundo: number;
  readonly estadoCondicion: EstadoJugadorZona;
}

const registroSimulacionPartida: readonly FichaJugadorSimulacion[] = [
  {
    jugadorId: "BR-3101",
    nombreJugador: "Kaelen Vance",
    faseActual: "Fase 3",
    distanciaAlCentroMetros: 120.5,
    vidaActualPct: 85.0,
    escudosActivos: true,
    estado: "EnLaTormenta",
  },
  {
    jugadorId: "BR-3102",
    nombreJugador: "Lyra Vestergaard",
    faseActual: "Fase 2",
    distanciaAlCentroMetros: 45.0,
    vidaActualPct: 100.0,
    escudosActivos: true,
    estado: "DentroDeZona",
  },
  {
    jugadorId: "BR-3103",
    nombreJugador: "Tazio Moretti",
    faseActual: "Fase Final",
    distanciaAlCentroMetros: 5.2,
    vidaActualPct: 92.5,
    escudosActivos: true,
    estado: "Victorioso",
  },
  {
    jugadorId: "BR-3104",
    nombreJugador: "Gaelen Thorne",
    faseActual: "Fase 3",
    distanciaAlCentroMetros: 350.0,
    vidaActualPct: 0.0,
    escudosActivos: false,
    estado: "EliminadoPorTormenta",
  },
  {
    jugadorId: "BR-3105",
    nombreJugador: "Marisol Hincapié",
    faseActual: "Fase 1",
    distanciaAlCentroMetros: 80.0,
    vidaActualPct: 60.0,
    escudosActivos: false,
    estado: "DentroDeZona",
  }
];

function validarParticipanteSimulacion(jugador: FichaJugadorSimulacion): boolean {
  return jugador.estado !== "EliminadoPorTormenta" && jugador.distanciaAlCentroMetros >= 0;
}

function calcularDanioTormentaPorFase(fase: FaseTormenta, distancia: number, escudos: boolean): number {
  let danioBase = 1.0;
  switch (fase) {
    case 'Fase 1':
      danioBase = 1.5;
      break;
    case 'Fase 2':
      danioBase = 3.0;
      break;
    case 'Fase 3':
      danioBase = 6.0;
      break;
    case 'Fase Final':
      danioBase = 10.0;
      break;
  }
  const factorDistancia = Math.max(1, distancia / 50);
  const reduccionEscudo = escudos ? 0.75 : 1.0;
  const danioFinal = danioBase * factorDistancia * reduccionEscudo;
  return Number(danioFinal.toFixed(2));
}

function procesarSimulacionZona(jugadores: readonly FichaJugadorSimulacion[]): readonly ResumenSimulacionZona[] {
  return jugadores
    .filter(validarParticipanteSimulacion)
    .map(jugador => {
      const danio = calcularDanioTormentaPorFase(jugador.faseActual, jugador.distanciaAlCentroMetros, jugador.escudosActivos);
      return {
        jugador: `${jugador.nombreJugador} [${jugador.jugadorId}]`,
        fase: jugador.faseActual,
        distancia: `${jugador.distanciaAlCentroMetros} m al centro`,
        danioEstimadoPorSegundo: danio,
        estadoCondicion: jugador.estado,
      };
    })
    .sort((a, b) => a.danioEstimadoPorSegundo - b.danioEstimadoPorSegundo);
}

function imprimirReporteSimulacion(titulo: string, resumen: readonly ResumenSimulacionZona[]): void {
  console.log(`=== [SIMULADOR DE ZONA BATTLE ROYALE] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Jugador: ${item.jugador} | Fase: ${item.fase} | Distancia: ${item.distancia} | Daño Tormenta: ${item.danioEstimadoPorSegundo} HP/s | Condición: ${item.estadoCondicion}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoSimulacionOficial = procesarSimulacionZona(registroSimulacionPartida);
imprimirReporteSimulacion("Estado de Jugadores Activos en la Partida", resultadoSimulacionOficial);

// Caso: Jugador atrapado en la tormenta de fase final a gran distancia con salud crítica y sin escudos
const jugadorCasoLimite: readonly FichaJugadorSimulacion[] = [
  {
    jugadorId: "BR-9999",
    nombreJugador: "Soren Vestergaard",
    faseActual: "Fase Final",
    distanciaAlCentroMetros: 500.0,
    vidaActualPct: 15.0,
    escudosActivos: false,
    estado: "EnLaTormenta",
  }
];

const resultadoLimite = procesarSimulacionZona(jugadorCasoLimite);
imprimirReporteSimulacion("Caso: Jugador en Zona Crítica de Alta Distancia y Daño Extremo", resultadoLimite);