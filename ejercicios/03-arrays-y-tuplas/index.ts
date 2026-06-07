export {};

// Ejercicio 3: Arrays y Tuplas
// Contexto: Equipos de futbol

// TODO: crea un array de jugadores.
const jugadores: string[] = ["Pedro", "Luis", "Marcos", "Simone", "Eduardo"];
const dorsales: number[] = [10, 7, 9, 11, 8];

// TODO: crea una tupla [golesLocal, golesVisitante].
const marcador: [number, number] = [5, 9];

// Crea un nuevo arreglo combinando los dorsales y los nombres de los jugadores
const nomina: string[] = dorsales.map(
  (dorsal, index) => `Jugador: ${jugadores[index]} - Camiseta: #${dorsal}`,
);

// Cálculo de goles totales en el partido
const golesTotales: number = marcador[0] + marcador[1];

// Imprime la nómina del equipo, el marcador actual y el total de goles en el partido.
console.log("Nómina del equipo:\n", nomina.join("\n"));
console.log(
  `\nMarcador actual:\nLocal ${marcador[0]} - Visitante ${marcador[1]}\n`,
);
console.log(`Total de goles en el partido: ${golesTotales}`);
