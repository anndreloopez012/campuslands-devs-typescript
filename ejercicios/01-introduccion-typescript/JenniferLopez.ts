export {};
// Ejercicio 1: Introduccion a TypeScript
const nombreJugador: string = "Diegojota";
let armaPrincipal: string = "Arco de fuego";
let municionDisponible: number = 5;
let tieneEscudoActivo: boolean = true;
const mapaActual: string = "Base Alpha";
const modoJuego: string = "Capturar la bandera";

console.log("=== ESTADO DEL JUGADOR ===");
console.log(`El jugador ${nombreJugador} cuenta con un arma principal: ${armaPrincipal}, con una munición de: ${municionDisponible} flechas y ${tieneEscudoActivo ? "Sí" : "No"} tiene el escudo activo; te encuentras en el mapa: ${mapaActual} y el modo de juego es: ${modoJuego}`);