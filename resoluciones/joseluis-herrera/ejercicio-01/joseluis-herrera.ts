// datos jugador 
const nombre: string = "Pacococo";
let arma_principal: string = "M1014";
let municion: number = 100; 
let tieneescudo: boolean = true; 

const map: string = "Zafari";
const modo_juego: string = "Battle Royale";

const resumenJugador: string = `${nombre} juega en el modo de juego
    ${modo_juego} jugando en el mapa
    ${map} con su arma principal una
    ${arma_principal} con
    ${municion} balas y escudo 
    ${tieneescudo ? "activo" : "inactivo"}.`;

console.log(resumenJugador);