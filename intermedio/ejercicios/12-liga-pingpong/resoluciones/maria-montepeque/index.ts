export {};

interface SetPingpong {
  readonly numero: number;
  readonly puntosJugadorA: number;
  readonly puntosJugadorB: number;
}

interface PartidoPingpong {
  readonly id: number;
  readonly jugadorA: string;
  readonly jugadorB: string;
  readonly sets: readonly SetPingpong[];
}

interface RankingJugador {
  readonly jugador: string;
  readonly victorias: number;
  readonly partidos: number;
}

const jornada: readonly PartidoPingpong[] = [
  {
    id: 1,
    jugadorA: "Paola Chen",
    jugadorB: "Ricardo Us",
    sets: [
      { numero: 1, puntosJugadorA: 11, puntosJugadorB: 7 },
      { numero: 2, puntosJugadorA: 9, puntosJugadorB: 11 },
      { numero: 3, puntosJugadorA: 11, puntosJugadorB: 6 },
    ],
  },
  {
    id: 2,
    jugadorA: "Ricardo Us",
    jugadorB: "Sara Molina",
    sets: [
      { numero: 1, puntosJugadorA: 11, puntosJugadorB: 9 },
      { numero: 2, puntosJugadorA: 8, puntosJugadorB: 11 },
      { numero: 3, puntosJugadorA: 12, puntosJugadorB: 10 },
    ],
  },
  {
    id: 3,
    jugadorA: "Sara Molina",
    jugadorB: "Paola Chen",
    sets: [
      { numero: 1, puntosJugadorA: 11, puntosJugadorB: 5 },
      { numero: 2, puntosJugadorA: 11, puntosJugadorB: 8 },
    ],
  },
  {
    id: 4,
    jugadorA: "Diego Vela",
    jugadorB: "Paola Chen",
    sets: [
      { numero: 1, puntosJugadorA: 11, puntosJugadorB: 9 },
      { numero: 2, puntosJugadorA: 9, puntosJugadorB: 11 },
      { numero: 3, puntosJugadorA: 11, puntosJugadorB: 4 },
      { numero: 4, puntosJugadorA: 8, puntosJugadorB: 11 },
      { numero: 5, puntosJugadorA: 11, puntosJugadorB: 9 },
    ],
  },
  {
    id: 5,
    jugadorA: "Diego Vela",
    jugadorB: "Diego Vela",
    sets: [
      { numero: 1, puntosJugadorA: 11, puntosJugadorB: 3 },
      { numero: 2, puntosJugadorA: 11, puntosJugadorB: 6 },
      { numero: 3, puntosJugadorA: 11, puntosJugadorB: 7 },
    ],
  },
  {
    id: 6,
    jugadorA: "Sara Molina",
    jugadorB: "Diego Vela",
    sets: [
      { numero: 1, puntosJugadorA: 11, puntosJugadorB: 9 },
      { numero: 2, puntosJugadorA: 10, puntosJugadorB: 9 },
      { numero: 3, puntosJugadorA: 11, puntosJugadorB: 8 },
    ],
  },
];

const esSetValido = (set: SetPingpong): boolean => {
  const maximo = Math.max(set.puntosJugadorA, set.puntosJugadorB);
  const diferencia = Math.abs(set.puntosJugadorA - set.puntosJugadorB);

  return maximo >= 11 && diferencia >= 2;
};

const esPartidoValido = (partido: PartidoPingpong): boolean => {
  if (partido.jugadorA === partido.jugadorB) {
    return false;
  }

  const cantidadSets = partido.sets.length;

  return (
    (cantidadSets === 3 || cantidadSets === 5) &&
    partido.sets.every(esSetValido)
  );
};

const determinarGanadorPartido = (partido: PartidoPingpong): string => {
  const setsGanadosA = partido.sets.filter(
    (set) => set.puntosJugadorA > set.puntosJugadorB,
  ).length;
  const setsGanadosB = partido.sets.length - setsGanadosA;

  return setsGanadosA > setsGanadosB ? partido.jugadorA : partido.jugadorB;
};

const calcularRanking = (
  partidos: readonly PartidoPingpong[],
): RankingJugador[] => {
  const acumulado = new Map<string, { victorias: number; partidos: number }>();

  const contar = (jugador: string, sumaVictoria: number): void => {
    const previo = acumulado.get(jugador) ?? { victorias: 0, partidos: 0 };
    acumulado.set(jugador, {
      victorias: previo.victorias + sumaVictoria,
      partidos: previo.partidos + 1,
    });
  };

  partidos.forEach((partido) => {
    const ganador = determinarGanadorPartido(partido);

    contar(partido.jugadorA, ganador === partido.jugadorA ? 1 : 0);
    contar(partido.jugadorB, ganador === partido.jugadorB ? 1 : 0);
  });

  return Array.from(acumulado, ([jugador, datos]) => ({
    jugador,
    victorias: datos.victorias,
    partidos: datos.partidos,
  })).sort((a, b) => b.victorias - a.victorias);
};

const procesarLiga = (partidos: readonly PartidoPingpong[]) => {
  const validos = partidos.filter(esPartidoValido);
  const invalidos = partidos.filter((partido) => !esPartidoValido(partido));

  return {
    validos,
    invalidos,
    ranking: calcularRanking(validos),
  };
};

// --- Render del Sistema ---
const resumen = procesarLiga(jornada);

console.log(
  `Ejercicio 12: Liga de pingpong\nPartidos totales: ${jornada.length}\nPartidos validos: ${resumen.validos.length}\nPartidos invalidos: ${resumen.invalidos.length}`,
);

resumen.invalidos.forEach((partido) =>
  console.log(`  - Partido #${partido.id} (${partido.jugadorA} vs ${partido.jugadorB}) tiene datos invalidos`),
);

console.log("Ranking de la liga:");
resumen.ranking.forEach((item, index) =>
  console.log(
    `${index + 1}. ${item.jugador} - ${item.victorias} victoria(s) en ${item.partidos} partido(s)`,
  ),
);
