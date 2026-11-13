export {};

type ResultadoPartido = 'Victoria' | 'Empate' | 'Derrota';
type EstadoFisicoJugador = 'Optimo' | 'Fatigado' | 'Lesionado';
type CategoriaCompeticion = 'Liga' | 'Copa' | 'Champions';

interface EstadisticaPartido {
  readonly jornada: number;
  readonly competicion: CategoriaCompeticion;
  readonly rival: string;
  readonly resultado: ResultadoPartido;
  readonly golesFavor: number;
  readonly golesContra: number;
  readonly posesionBalonPct: number;
}

interface FichaJugadorCarrera {
  readonly jugadorId: string;
  readonly nombreCompleto: string;
  readonly posicion: 'Delantero' | 'Mediocampista' | 'Defensa' | 'Portero';
  readonly valoracionGeneral: number; // de 0 a 99
  readonly estadoFisico: EstadoFisicoJugador;
  readonly partidosJugados: readonly EstadisticaPartido[];
}

interface ResumenRendimientoTemporada {
  readonly jugador: string;
  readonly posicionPrincipal: string;
  readonly totalPartidos: number;
  readonly puntosObtenidos: number;
  readonly golesTotales: number;
  readonly promedioValoracionRendimiento: number;
  readonly condicionActual: EstadoFisicoJugador;
}

const registroCarreraPlantilla: readonly FichaJugadorCarrera[] = [
  {
    jugadorId: "FC-3201",
    nombreCompleto: "Mateo Salvatierra",
    posicion: "Delantero",
    valoracionGeneral: 88,
    estadoFisico: "Optimo",
    partidosJugados: [
      { jornada: 1, competicion: "Liga", rival: "Real Madrid", resultado: "Victoria", golesFavor: 2, golesContra: 1, posesionBalonPct: 52 },
      { jornada: 2, competicion: "Champions", rival: "Bayern Munich", resultado: "Empate", golesFavor: 1, golesContra: 1, posesionBalonPct: 48 },
      { jornada: 3, competicion: "Liga", rival: "FC Barcelona", resultado: "Victoria", golesFavor: 3, golesContra: 2, posesionBalonPct: 55 }
    ]
  },
  {
    jugadorId: "FC-3202",
    nombreCompleto: "Thiago Albarracín",
    posicion: "Mediocampista",
    valoracionGeneral: 85,
    estadoFisico: "Optimo",
    partidosJugados: [
      { jornada: 1, competicion: "Liga", rival: "Real Madrid", resultado: "Victoria", golesFavor: 2, golesContra: 1, posesionBalonPct: 52 },
      { jornada: 2, competicion: "Champions", rival: "Bayern Munich", resultado: "Empate", golesFavor: 1, golesContra: 1, posesionBalonPct: 48 },
      { jornada: 3, competicion: "Copa", rival: "Valencia CF", resultado: "Victoria", golesFavor: 4, golesContra: 0, posesionBalonPct: 60 }
    ]
  },
  {
    jugadorId: "FC-3203",
    nombreCompleto: "Dante Montenegro",
    posicion: "Defensa",
    valoracionGeneral: 82,
    estadoFisico: "Fatigado",
    partidosJugados: [
      { jornada: 1, competicion: "Liga", rival: "Real Madrid", resultado: "Derrota", golesFavor: 0, golesContra: 2, posesionBalonPct: 45 },
      { jornada: 2, competicion: "Liga", rival: "Sevilla FC", resultado: "Victoria", golesFavor: 1, golesContra: 0, posesionBalonPct: 50 }
    ]
  },
  {
    jugadorId: "FC-3204",
    nombreCompleto: "Iker Santamaría",
    posicion: "Portero",
    valoracionGeneral: 86,
    estadoFisico: "Lesionado",
    partidosJugados: [
      { jornada: 1, competicion: "Champions", rival: "Manchester City", resultado: "Derrota", golesFavor: 0, golesContra: 3, posesionBalonPct: 40 }
    ]
  },
  {
    jugadorId: "FC-3205",
    nombreCompleto: "Lucas Pardo",
    posicion: "Delantero",
    valoracionGeneral: 79,
    estadoFisico: "Optimo",
    partidosJugados: [
      { jornada: 1, competicion: "Copa", rival: "Real Betis", resultado: "Victoria", golesFavor: 2, golesContra: 1, posesionBalonPct: 54 },
      { jornada: 2, competicion: "Liga", rival: "Villarreal CF", resultado: "Empate", golesFavor: 2, golesContra: 2, posesionBalonPct: 51 }
    ]
  }
];

function validarJugadorActivo(jugador: FichaJugadorCarrera): boolean {
  return jugador.estadoFisico !== "Lesionado" && jugador.partidosJugados.length > 0;
}

function calcularPuntajePartidos(partidos: readonly EstadisticaPartido[]): number {
  return partidos.reduce((acumulado, partido) => {
    if (partido.resultado === "Victoria") return acumulado + 3;
    if (partido.resultado === "Empate") return acumulado + 1;
    return acumulado;
  }, 0);
}

function calcularGolesTotales(partidos: readonly EstadisticaPartido[]): number {
  return partidos.reduce((acumulado, partido) => acumulado + partido.golesFavor, 0);
}

function procesarTemporadaCarrera(jugadores: readonly FichaJugadorCarrera[]): readonly ResumenRendimientoTemporada[] {
  return jugadores
    .filter(validarJugadorActivo)
    .map(jugador => {
      const puntos = calcularPuntajePartidos(jugador.partidosJugados);
      const goles = calcularGolesTotales(jugador.partidosJugados);
      return {
        jugador: `${jugador.nombreCompleto} [${jugador.jugadorId}]`,
        posicionPrincipal: jugador.posicion,
        totalPartidos: jugador.partidosJugados.length,
        puntosObtenidos: puntos,
        golesTotales: goles,
        promedioValoracionRendimiento: Number((jugador.valoracionGeneral * (jugador.estadoFisico === 'Optimo' ? 1.0 : 0.9)).toFixed(1)),
        condicionActual: jugador.estadoFisico,
      };
    })
    .sort((a, b) => b.puntosObtenidos - a.puntosObtenidos);
}

function imprimirReporteTemporada(titulo: string, resumen: readonly ResumenRendimientoTemporada[]): void {
  console.log(`=== [TEMPORADA MODO CARRERA - FÚTBOL] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Jugador: ${item.jugador} | Pos: ${item.posicionPrincipal} | Partidos: ${item.totalPartidos} | Pts Equipo: ${item.puntosObtenidos} | Goles: ${item.golesTotales} | Valoración: ${item.promedioValoracionRendimiento} | Condición: ${item.condicionActual}`
    );
  });
  console.log("===================================================================================================\n");
}

const resultadoTemporadaOficial = procesarTemporadaCarrera(registroCarreraPlantilla);
imprimirReporteTemporada("Rendimiento General de Jugadores Activos", resultadoTemporadaOficial);

// Caso: Jugador estrella con estado físico crítico (Lesionado / Fatigado) o partidos sin registrar
const jugadorCasoLimite: readonly FichaJugadorCarrera[] = [
  {
    jugadorId: "FC-9999",
    nombreCompleto: "Valentin Kvaratskhelia",
    posicion: "Delantero",
    valoracionGeneral: 91,
    estadoFisico: "Lesionado",
    partidosJugados: [
      { jornada: 1, competicion: "Champions", rival: "Inter de Milán", resultado: "Derrota", golesFavor: 0, golesContra: 1, posesionBalonPct: 49 }
    ]
  }
];

const resultadoLimite = procesarTemporadaCarrera(jugadorCasoLimite);
imprimirReporteTemporada("Caso Límite: Jugador Clave con Estado Lesionado", resultadoLimite);