export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter

// TODO: declara las variables tipadas del jugador.
const nickname: string = "Evelyn_Sniper";
const puntosDeVida: number = 100;
const tieneEscudo: boolean = true;
const armaFavorita: string = "Rifle de Precisión";
const nivelActual: number = 15;

// Reto: Mapa y Modo de juego
const mapaActual: string = "Base Lunar Alpha";
const modoDeJuego: string = "Capturar la bandera";

// TODO: imprime un resumen usando console.log.
console.log("=== ESTADÍSTICAS DEL JUGADOR ===");
console.log(`Nombre: ${nickname}`);
console.log(`Vida: ${puntosDeVida}%`);
console.log(`Equipamiento: ${armaFavorita}`);
console.log(`Estado del Escudo: ${tieneEscudo ? "Activo" : "Destruido"}`);
console.log(`Nivel: ${nivelActual}`);
console.log("--------------------------------");
console.log(`Ubicación: ${mapaActual}`);
console.log(`Modo: ${modoDeJuego}`);
