export {};

// Ejercicio 1: Introduccion a TypeScript
// Contexto: Videojuegos Shooter

// 1) Datos del jugador. Uso const porque ninguno de estos valores va a cambiar.
const nombre: string = "NovatoGT";
const armaPrincipal: string = "Pistola estandar";
const municionDisponible: number = 60;
const escudoActivo: boolean = false;

// 2) Reto extra: mapa actual y modo de juego.
const mapaActual: string = "Almacen Industrial";
const modoJuego: string = "Todos contra todos";

// 3) Construyo el resumen con un template literal.
const resumen: string =
  `Jugador: ${nombre}\n` +
  `Arma principal: ${armaPrincipal}\n` +
  `Municion disponible: ${municionDisponible} balas\n` +
  `Escudo: ${escudoActivo ? "activo" : "inactivo"}\n` +
  `Mapa: ${mapaActual}\n` +
  `Modo de juego: ${modoJuego}`;

// 4) Muestro el resumen en consola.
console.log(resumen);
