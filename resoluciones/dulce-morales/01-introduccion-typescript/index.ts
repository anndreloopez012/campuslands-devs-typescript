export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter

// TODO: declara las variables tipadas del jugador.
// Datos sugeridos:
const nombre_jugador: string = "Alexa";
const arma_principal: string = "Rifle de asalto";
let municion: number = 120;
let escudo: boolean = true;
// Reto extra:
let mapa_actual: string = "Zona Delta";
let modo_juego: string = "Battele Royale";

// TODO: imprime un resumen usando console.log.
console.log(
  `Nombre del jugador: ${nombre_jugador}\n`+
  `Arma principal: ${arma_principal} \n`+
  `Munición disponible: ${municion} \n`+
  `Estados del escudo: ${escudo ? "Activo" : "Inactivo"}\n`+
  `Mapa actual:${mapa_actual} \n`+
  `Modo de juego: ${modo_juego}`
  );
