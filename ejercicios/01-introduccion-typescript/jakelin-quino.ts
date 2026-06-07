export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter

// TODO: declara las variables tipadas del jugador.

// TODO: imprime un resumen usando console.log.
//nombre, arma principal, municion disponible y si tiene escudo activo

console.log("---------  Ejercicio 1: Introduccion a TypeScript ---------");
let nombre:string = "Super Ninja";
let arma:string = "Katana";
let municion:number = 100;
let salud:number = 100;
let escudoActivo:boolean = true;

console.log(`Jugador: ${nombre}`);
console.log(`Arma Principal: ${arma}`);
console.log(`Munición Disponible: ${municion}`);
console.log(`Salud: ${salud}`);
console.log(`Escudo Activo: ${escudoActivo ? "Sí" : "No"}`);

function modoJuego() {
    if (!escudoActivo) {
        console.log(`Modo de Juego: Ofensivo`);
    }else {
        console.log(`Modo de Juego: Defensivo`);
    }
}
modoJuego();