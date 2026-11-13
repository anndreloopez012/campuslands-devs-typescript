export {};

type EstiloJuego = 'Ofensivo Loop' | 'Defensivo Chop' | 'Bloqueo Rapido' | 'All-Rounder';
type EstadoEncuentro = 'Completado' | 'EnCurso' | 'Walkover';

interface ParcialSet {
  readonly numeroSet: number;
  readonly puntosJugadorA: number;
  readonly puntosJugadorB: number;
}

interface EncuentroPingPong {
  readonly encuentroId: string;
  readonly jugadorA: string;
  readonly estiloA: EstiloJuego;
  readonly jugadorB: string;
  readonly estiloB: EstiloJuego;
  readonly sets: readonly ParcialSet[];
  readonly estado: EstadoEncuentro;
}

interface ResumenEncuentroPingPong {
  readonly duelo: string;
  readonly marcadorSets: string;
  readonly puntosTotalesAnotados: number;
  readonly ganador: string;
  readonly intensidadDuelo: string;
}

const torneoMesaDorada: readonly EncuentroPingPong[] = [
  {
    encuentroId: "PNG-201",
    jugadorA: "Kenji Takahashi",
    estiloA: "Ofensivo Loop",
    jugadorB: "Soren Lindqvist",
    estiloB: "Defensivo Chop",
    sets: [
      { numeroSet: 1, puntosJugadorA: 11, puntosJugadorB: 8 },
      { numeroSet: 2, puntosJugadorA: 9, puntosJugadorB: 11 },
      { numeroSet: 3, puntosJugadorA: 11, puntosJugadorB: 6 },
      { numeroSet: 4, puntosJugadorA: 11, puntosJugadorB: 9 }
    ],
    estado: "Completado",
  },
  {
    encuentroId: "PNG-202",
    jugadorA: "Valeria Mendoza",
    estiloA: "Bloqueo Rapido",
    jugadorB: "Thiago Montalvo",
    estiloB: "All-Rounder",
    sets: [
      { numeroSet: 1, puntosJugadorA: 11, puntosJugadorB: 7 },
      { numeroSet: 2, puntosJugadorA: 11, puntosJugadorB: 5 },
      { numeroSet: 3, puntosJugadorA: 11, puntosJugadorB: 9 }
    ],
    estado: "Completado",
  },
  {
    encuentroId: "PNG-203",
    jugadorA: "Bastian Kroll",
    estiloA: "Ofensivo Loop",
    jugadorB: "Dario Kovacic",
    estiloB: "Bloqueo Rapido",
    sets: [
      { numeroSet: 1, puntosJugadorA: 8, puntosJugadorB: 11 },
      { numeroSet: 2, puntosJugadorA: 11, puntosJugadorB: 9 },
      { numeroSet: 3, puntosJugadorA: 7, puntosJugadorB: 11 },
      { numeroSet: 4, puntosJugadorA: 11, puntosJugadorB: 8 },
      { numeroSet: 5, puntosJugadorA: 11, puntosJugadorB: 9 }
    ],
    estado: "Completado",
  },
  {
    encuentroId: "PNG-204",
    jugadorA: "Cillian Vance",
    estiloA: "All-Rounder",
    jugadorB: "Aurelio Castellanos",
    estiloB: "Defensivo Chop",
    sets: [],
    estado: "Walkover",
  }
];

function validarEncuentroValido(encuentro: EncuentroPingPong): boolean {
  return encuentro.estado === "Completado" && encuentro.sets.length >= 3;
}

function calcularBalanceSets(sets: readonly ParcialSet[]): {
  readonly setsA: number;
  readonly setsB: number;
  readonly puntosTotales: number;
} {
  return sets.reduce(
    (acumulado, setActual) => ({
      setsA: acumulado.setsA + (setActual.puntosJugadorA > setActual.puntosJugadorB ? 1 : 0),
      setsB: acumulado.setsB + (setActual.puntosJugadorB > setActual.puntosJugadorA ? 1 : 0),
      puntosTotales: acumulado.puntosTotales + setActual.puntosJugadorA + setActual.puntosJugadorB,
    }),
    { setsA: 0, setsB: 0, puntosTotales: 0 }
  );
}

function evaluarIntensidadDuelo(puntosTotales: number, cantidadSets: number): string {
  if (cantidadSets === 5 && puntosTotales >= 95) return "Maratón de Alta Tensión (Deuce Extremo)";
  if (cantidadSets >= 4) return "Duelo Competitivo Reñido";
  return "Victoria Directa Contundente";
}

function procesarLigaPingPong(encuentros: readonly EncuentroPingPong[]): readonly ResumenEncuentroPingPong[] {
  return encuentros
    .filter(validarEncuentroValido)
    .map(encuentro => {
      const balance = calcularBalanceSets(encuentro.sets);
      const ganador = balance.setsA > balance.setsB ? encuentro.jugadorA : encuentro.jugadorB;
      return {
        duelo: `${encuentro.jugadorA} (${encuentro.estiloA}) vs ${encuentro.jugadorB} (${encuentro.estiloB}) [${encuentro.encuentroId}]`,
        marcadorSets: `${balance.setsA} - ${balance.setsB}`,
        puntosTotalesAnotados: balance.puntosTotales,
        ganador,
        intensidadDuelo: evaluarIntensidadDuelo(balance.puntosTotales, encuentro.sets.length),
      };
    })
    .sort((a, b) => b.puntosTotalesAnotados - a.puntosTotalesAnotados);
}

function imprimirResultadosLiga(titulo: string, resultados: readonly ResumenEncuentroPingPong[]): void {
  console.log(`=== [LIGA DE PINGPONG] ${titulo} ===`);
  resultados.forEach((item, indice) => {
    console.log(
      `${indice + 1}. ${item.duelo} | Sets: ${item.marcadorSets} | Puntos Totales: ${item.puntosTotalesAnotados} | Ganador: ${item.ganador} | Ritmo: ${item.intensidadDuelo}`
    );
  });
  console.log("===============================================================\n");
}

const resultadosJornadaOficial = procesarLigaPingPong(torneoMesaDorada);
imprimirResultadosLiga("Resultados Oficiales de la Jornada", resultadosJornadaOficial);

// Caso: Partido definido en cinco sets con múltiples extensiones de diferencia de dos puntos
const encuentroCasoDeuce: readonly EncuentroPingPong[] = [
  {
    encuentroId: "PNG-999",
    jugadorA: "Hana Takahashi",
    estiloA: "Ofensivo Loop",
    jugadorB: "Marek Nowak",
    estiloB: "Defensivo Chop",
    sets: [
      { numeroSet: 1, puntosJugadorA: 15, puntosJugadorB: 13 },
      { numeroSet: 2, puntosJugadorA: 12, puntosJugadorB: 14 },
      { numeroSet: 3, puntosJugadorA: 16, puntosJugadorB: 14 },
      { numeroSet: 4, puntosJugadorA: 11, puntosJugadorB: 13 },
      { numeroSet: 5, puntosJugadorA: 14, puntosJugadorB: 12 }
    ],
    estado: "Completado",
  }
];

const resultadoDeuce = procesarLigaPingPong(encuentroCasoDeuce);
imprimirResultadosLiga("Caso: Maratón de Cinco Sets con Deuce Prolongado", resultadoDeuce);