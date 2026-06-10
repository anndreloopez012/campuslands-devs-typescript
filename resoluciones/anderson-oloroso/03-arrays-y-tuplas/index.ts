export {};

// Ejercicio 3: Arrays y Tuplas
// Contexto: Equipos de futbol

// TODO: crea un array de jugadores.
// TODO: crea una tupla [golesLocal, golesVisitante].

console.log("========== Arrays y Tuplas ==========");

let jugadores: string[] = [
  "Messi",
  "Ronaldo",
  "Neymar",
  "Mbappe",
  "Lewandowski",
];
let resultadoPartido: [number, number] = [3, 2];

console.log("Jugadores del equipo:");
jugadores.forEach((jugador, index) => {
  console.log(`${index + 1}. ${jugador}`);
});

console.log(
  `Resultado del partido: ${resultadoPartido[0]} - ${resultadoPartido[1]}`,
);
