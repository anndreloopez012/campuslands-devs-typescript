export {};

const jugadores: string[] = ["Valeria", "Mateo", "Santiago", "Camila", "Nicolas"];
const dorsales: number[] = [10, 7, 5, 11, 1];
const marcador: [number, number] = [4, 2];

const totalGoles: number = marcador[0] + marcador[1];
const plantilla: string[] = jugadores.map((jugador, index) => `#${dorsales[index]} ${jugador}`);

console.log("Plantilla:", plantilla.join(", "));
console.log(`Marcador final: Campus FC ${marcador[0]} - ${marcador[1]} Visitantes`);
console.log(`Total de goles: ${totalGoles}`);
