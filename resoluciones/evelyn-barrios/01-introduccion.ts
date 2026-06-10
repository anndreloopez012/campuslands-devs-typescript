export {};

const nombreJugador: string = "Evelyn_Sniper";
const armaPrincipal: string = "Rifle de Plasma";
let municionDisponible: number = 45;
let tieneEscudoActivo: boolean = true;

// Reto Extra
const mapaActual: string = "Base Lunar";
const modoDeJuego: string = "Duelo por equipos";

console.log(`--- Jugador: ${nombreJugador} ---`);
console.log(`Arma: ${armaPrincipal} | Munición: ${municionDisponible}`);
console.log(`Escudo: ${tieneEscudoActivo ? "Protegido" : "Vulnerable"}`);
console.log(`Ubicación: ${mapaActual} (${modoDeJuego})`);
