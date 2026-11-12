export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter

// TODO: declara las variables tipadas del jugador.
// nombre, arma principal, municion disponible y si tiene escudo activo. Muestra un resumen por consola.
const nombre: string = "TheMarine47";
let armaPrincipal: string = "Sniper";
let municionDisponible: number = 30;
let escudoActivo: boolean = true;

// reto extra: Agrega una variable para el mapa actual y otra para el modo de juego.
const mapaActual: string = "Alcatraz";
const modoDeJuego: string = "Battle Royal";

// TODO: imprime un resumen usando console.log.
console.log(`Nombre: ${nombre}`);
console.log(`Arma Principal: ${armaPrincipal}`);
console.log(`Municion Disponible: ${municionDisponible}`);
console.log(`Escudo Activo: ${escudoActivo}`);
console.log(`Mapa Actual: ${mapaActual}`);
console.log(`Modo de Juego: ${modoDeJuego}`);