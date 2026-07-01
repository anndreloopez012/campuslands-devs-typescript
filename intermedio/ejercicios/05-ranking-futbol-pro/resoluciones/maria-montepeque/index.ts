export {};

type Posicion = "delantero" | "mediocampista" | "defensa" | "portero";

interface Jugador {
  readonly id: number;
  readonly nombre: string;
  readonly posicion: Posicion;
  readonly goles: number;
  readonly asistencias: number;
  readonly partidosJugados: number;
}
interface JugadorRankeado extends Jugador {
  readonly puntaje: number;
  readonly promedioPorPartido: number;
}

const jugadores: readonly Jugador[] = [
  {
    id: 1,
    nombre: "Lionel Vega",
    posicion: "delantero",
    goles: 24,
    asistencias: 6,
    partidosJugados: 30,
  },
  {
    id: 2,
    nombre: "Marco Silva",
    posicion: "mediocampista",
    goles: 8,
    asistencias: 15,
    partidosJugados: 28,
  },
  {
    id: 3,
    nombre: "Diego Ruiz",
    posicion: "defensa",
    goles: 2,
    asistencias: 3,
    partidosJugados: 32,
  },
  {
    id: 4,
    nombre: "Hugo Paz",
    posicion: "portero",
    goles: 0,
    asistencias: 0,
    partidosJugados: 0,
  },
  {
    id: 5,
    nombre: "Andres Mora",
    posicion: "delantero",
    goles: 24,
    asistencias: 6,
    partidosJugados: 22,
  },
];

const ranking: JugadorRankeado[] = jugadores
  .filter((j) => j.goles >= 0 && j.asistencias >= 0 && j.partidosJugados >= 0)
  .map((j) => {
    const puntaje = j.goles * 4 + j.asistencias * 2;
    return {
      ...j,
      puntaje,
      promedioPorPartido:
        j.partidosJugados === 0
          ? 0
          : Number((puntaje / j.partidosJugados).toFixed(2)),
    };
  })

  .sort(
    (a, b) =>
      b.puntaje - a.puntaje || b.promedioPorPartido - a.promedioPorPartido,
  );

// Salida por consola limpia
console.log("Ranking de jugadores de futbol");
ranking.forEach((j, i) =>
  console.log(
    `${i + 1}. ${j.nombre} (${j.posicion}) - puntaje: ${j.puntaje}, prom/partido: ${j.promedioPorPartido}`,
  ),
);

console.log(
  `Total jugadores rankeados: ${ranking.length}\nLider del ranking: ${ranking[0]?.nombre ?? "sin datos"}`,
);
