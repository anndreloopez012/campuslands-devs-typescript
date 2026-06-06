export {};

// Ejercicio 03: Arrays y Tuplas

// --- ARRAYS (listas homogeneas) ---
const jugadores: string[] = [
  "Valeria",
  "Mateo",
  "Santiago",
  "Camila",
  "Nicolas",
];

// Reto extra
const dorsales: number[] = [10, 7, 5, 11, 1];

// push() agrega un elemento al final del array
jugadores.push("Lucia");
dorsales.push(9);

// --- TUPLA (posiciones fijas con tipo) ---
const marcador: [number, number] = [4, 2];

// --- CALCULOS ---
const totalGoles: number = marcador[0] + marcador[1];

const plantilla: string[] = jugadores.map(
  (jugador, indice) => `#${dorsales[indice]} ${jugador}`,
);

// --- RESULTADO EN CONSOLA --
console.log("Plantilla:", plantilla.join(", "));
console.log(
  `Marcador final: Campus FC ${marcador[0]} - ${marcador[1]} Visitantes`,
);
console.log(`Total de goles: ${totalGoles}`);
