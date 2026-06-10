export {};

const alineacion: string[] = ["Casillas", "Puyol", "Xavi", "Iniesta"];
const resultadoFinal: [number, number] = [2, 0];

// Reto Extra
const dorsales: number[] = [1, 5, 6, 8];
const totalGoles: number = resultadoFinal[0] + resultadoFinal[1];

console.log("Jugadores en campo:", alineacion.join(", "));
console.log("Dorsales:", dorsales);
console.log(`Marcador: ${resultadoFinal[0]} - ${resultadoFinal[1]}`);
console.log("Goles totales del encuentro:", totalGoles);
