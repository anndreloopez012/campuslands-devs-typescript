export {};

// 1. DEFINICIÓN DE TIPOS
// Usamos una interfaz para asegurar la estructura de cada jugador
interface Jugador {
    nombre: string;
    posicion: string;
    dorsal: number;
}

// 2. DATOS
// Array de jugadores (sin usar 'any')
const plantilla: Jugador[] = [
    { nombre: "Carlos Ruiz", posicion: "Portero", dorsal: 1 },
    { nombre: "Juan Pérez", posicion: "Ala", dorsal: 7 },
    { nombre: "Luis Soto", posicion: "Cierre", dorsal: 5 }
];

// Tupla para el marcador: [Goles Equipo A, Goles Equipo B]
// La restricción de exactamente dos números se cumple al definir la tupla [number, number]
const marcador: [number, number] = [3, 2];

// Lista de dorsales (numérica)
const listaDorsales: number[] = plantilla.map(j => j.dorsal);

// Lista de goles por jugador (exclusivamente números, sin strings)
const golesPorJugador: number[] = [1, 2, 0]; 

// 3. CÁLCULO DEL TOTAL
// Usamos .reduce para sumar los números del array sin mezclar tipos
const totalGoles: number = golesPorJugador.reduce((suma, goles) => suma + goles, 0);

// 4. RESULTADOS
console.log("=== PLANTILLA DEL EQUIPO ===");
plantilla.forEach(j => console.log(`${j.nombre} (Dorsal ${j.dorsal}) - ${j.posicion}`));

console.log("\n=== MARCADOR FINAL ===");
console.log(`Equipo A ${marcador[0]} - ${marcador[1]} Equipo B`);

console.log("\n=== ESTADÍSTICAS ===");
console.log(`Dorsales en cancha: ${listaDorsales.join(", ")}`);
console.log(`Total de goles anotados: ${totalGoles}`);