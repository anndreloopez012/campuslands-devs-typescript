export {};

// Ejercicio 3: Arrays y Tuplas
// Contexto: Equipos de futbol

// TODO: crea un array de jugadores.
// TODO: crea una tupla [golesLocal, golesVisitante].

const jugadores: string[] = [
    "Alejandro",
    "Beatriz",
    "Carlos",
    "Daniela",
    "Esteban",
    "Fernanda",
    "Gabriel",
    "Héctor",
    "Isabel",
    "Javier"
];
const marcador:[number,number] = [
    7,5
]
const dorsale:number[] = [
    7,8,11,10,30,5,2,9,8,1
]
const goles = marcador[0] + marcador[1]
const diferenciasGoles = Math.abs(marcador[0] - marcador[1])
