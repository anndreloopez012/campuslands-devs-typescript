export {};

// Ejercicio 01: Variables y constantes - videojuegos shooter
// Versión adaptada a TypeScript

console.log("Ejercicio 01: Variables y constantes");

// ==========================================
// CONFIGURACIÓN DEL ESTADO INICIAL DEL JUEGO
// ==========================================

// El nombre del jugador es constante. En TS, al ser const, su tipo es el string literal "Neo_Break"
const jugador: string = "Neo_Break"; 

// Añadimos anotaciones de tipo ( :string, :number ) a las variables
let arma: string = "Rifle de Plasma";
let vida: number = 100;
let municion: number = 30;

// Usamos un tipo literal de unión para que la partida SOLO acepte estos tres estados exactos
let estadoPartida: "En Progreso" | "Victoria" | "Game Over" = "En Progreso"; 

// ==========================================
// IMPRESIÓN EN CONSOLA
// ==========================================
console.log("=== ESTADO DE LA PARTIDA ===");
console.log(`Jugador: ${jugador}`);
console.log(`Arma equipada: ${arma}`);
console.log(`Puntos de Vida: ${vida} HP`);
console.log(`Munición restante: ${municion} balas`);
console.log(`Estado actual: ${estadoPartida}`);
console.log("============================");
