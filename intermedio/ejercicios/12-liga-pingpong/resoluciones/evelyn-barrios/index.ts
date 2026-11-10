export {};

type ManoDominante = "Diestro" | "Zurdo";

interface SetTenisMesa {
  readonly puntosJugador1: number;
  readonly puntosJugador2: number;
}

interface PartidoPingPong {
  readonly id: string;
  readonly jugador1: string;
  readonly jugador2: string;
  readonly sets: readonly SetTenisMesa[];
}

interface ResumenPartido {
  readonly ganador: string;
  readonly setsJugador1: number;
  readonly setsJugador2: number;
  readonly puntosTotales: number;
}

function procesarPartido(partido: PartidoPingPong): ResumenPartido {
  let setsJ1 = 0;
  let setsJ2 = 0;
  let puntosTotales = 0;

  for (const set of partido.sets) {
    puntosTotales += set.puntosJugador1 + set.puntosJugador2;
    if (set.puntosJugador1 > set.puntosJugador2) {
      setsJ1 += 1;
    } else {
      setsJ2 += 1;
    }
  }

  const ganador = setsJ1 > setsJ2 ? partido.jugador1 : partido.jugador2;

  return {
    ganador,
    setsJugador1: setsJ1,
    setsJugador2: setsJ2,
    puntosTotales,
  };
}

const partidoFinal: PartidoPingPong = {
  id: "tt-final-01",
  jugador1: "Ma Long",
  jugador2: "Fan Zhendong",
  sets: [
    { puntosJugador1: 11, puntosJugador2: 9 },
    { puntosJugador1: 8, puntosJugador2: 11 },
    { puntosJugador1: 11, puntosJugador2: 7 },
    { puntosJugador1: 12, puntosJugador2: 10 },
  ],
};

console.log("=== LIGA DE TENIS DE MESA / PINGPONG ===");
const resultado = procesarPartido(partidoFinal);
console.log(`Encuentro: ${partidoFinal.jugador1} vs ${partidoFinal.jugador2}`);
console.log(`Resultado sets: ${resultado.setsJugador1} - ${resultado.setsJugador2}`);
console.log(`Ganador oficial: ${resultado.ganador} (Puntos totales disputados: ${resultado.puntosTotales})`);