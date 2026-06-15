export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter

// TODO: declara las variables tipadas del jugador.

// TODO: imprime un resumen usando console.log.

const nombre: string = "Velas";
let arma_principal: string = "M4A1";
let municion: string = "5.56x45mm NATO";
let balas : number = 150;
let escudo: boolean = true;
const mapa: string = 'Desierto';
const modo: string = 'battalla campal';

const mensaje: string = `El operador ${nombre} está listo en el mapa ${mapa} para el modo ${modo}. Lleva su ${arma_principal} con el tipo de munición ${municion} y le quedan ${balas} de balas y su estado de escudo es: ${escudo ? "Activo" : "Desactivado"}.`;

console.log(mensaje);
