export {};

// Ejercicio 3: Arrays y Tuplas
// Contexto: Equipos de futbol

// TODO: crea un array de jugadores.
const plantilla: string[] = ["Ronaldo", "Marco", "Batistuta", "Pantic", "Falçao"];
// TODO: Lista de dorsales de la plantilla.
const dorsales: number[] = [9, 11, 10, 7, 12];
let totalGoles: number = 0;

for (let i = 0; i < dorsales.length; i++) {
    console.log(`Dorsal: ${dorsales[i]} Jugador: ${plantilla[i]}`);
}


// TODO: crea una tupla [golesLocal, golesVisitante].
const marcador: [number, number] = [5, 2];
console.log(`Marcador: Local ${marcador[0]} - Visitante ${marcador[1]}`);
console.log(`Total de goles: ${marcador[0] + marcador[1]}`);