export {};

// Ejercicio 3: Arrays y Tuplas
// Contexto: Equipos de futbol

// TODO: crea un array de jugadores.
// TODO: crea una tupla [golesLocal, golesVisitante].

console.log("-------- Ejercicio 3: Arrays y Tuplas --------");

let jugadoresBarsa: string[] = ["Pedri", "Gavi", "Ansu Fati", "Ferran Torres"];
let dorsalesBarsa: number[] = [10, 30, 11, 7];
const resultadoPartidoUno: [number, number] = [2, 1];
let nuevoJugadorBarsa: string = "Lewandowski";
jugadoresBarsa.push(nuevoJugadorBarsa);
let listaJugadoresBarsa: string = jugadoresBarsa.join(", ");

console.log("Array de Jugadores del Barcelona:", jugadoresBarsa);
console.log("Dorsales del Barcelona:", dorsalesBarsa);
console.log("Resultado del primer partido (Barcelona vs Real Madrid):", resultadoPartidoUno);
console.log("Lista de jugadores del Barcelona:", listaJugadoresBarsa);
