export {};

const jugadores: string[] = [
    "Andres",
    "Kevin",
    "Josue",
    "Mateo",
    "Brayan"
];

jugadores.push("Cristian");

const marcador: [number, number] = [4, 2];
const goles: number[] = [1, 2, 1, 2];
const totalGoles: number = goles[0] + goles[1] + goles[2] + goles[3];

console.log("Plantilla:", jugadores.join(", "));
console.log("Marcador:", marcador[0], "-", marcador[1]);
console.log("Total de goles:", totalGoles);
