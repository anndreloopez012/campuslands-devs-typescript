export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter
// Resolucion: Dulce Morales

// Datos del jugador (no cambian durante la partida)
const nombreJugador: string = "Dulce_Sniper";
const armaPrincipal: string = "Rifle de asalto M4";

// Estado que puede cambiar durante la partida
let municionDisponible: number = 120;
let escudoActivo: boolean = true;

// Reto extra: mapa y modo de juego
const mapaActual: string = "Desierto Rojo";
const modoDeJuego: string = "Equipo vs Equipo";

// Simulamos un pequeno cambio de estado: dispara una rafaga y pierde el escudo
const disparosRealizados: number = 30;
municionDisponible = municionDisponible - disparosRealizados;
escudoActivo = false;

const estadoEscudo: string = escudoActivo ? "Activo" : "Inactivo";

console.log("===== RESUMEN DEL JUGADOR =====");
console.log(`Jugador:             ${nombreJugador}`);
console.log(`Arma principal:      ${armaPrincipal}`);
console.log(`Municion disponible: ${municionDisponible}`);
console.log(`Escudo:              ${estadoEscudo}`);
console.log(`Mapa actual:         ${mapaActual}`);
console.log(`Modo de juego:       ${modoDeJuego}`);
console.log("===============================");
