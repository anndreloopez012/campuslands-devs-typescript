export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter

// TODO: declara las variables tipadas del jugador.

// TODO: imprime un resumen usando console.log.

const nombreJugador: string = "PlayerOne";
let armaPrincipal: string= "Rifle de Asalto";
let municion: number = 120;
let escudo: boolean = true;
const mapa: string = "Desierto de Arena";
const modoJuego: string = "Battle Royale";

const resumen: string =
    nombreJugador + " está jugando " + modoJuego + " en el mapa " + mapa + " con el arma " + armaPrincipal + " y tiene " + municion + " balas y escudo " + (escudo ? "activo" : "inactivo") + ".";
console.log(resumen);
