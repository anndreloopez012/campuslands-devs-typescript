export {};

// Ejercicio 03: Arrays y Tuplas
// Contexto: Equipos de Fútbol Profesional

// Tupla para jugador clave: [nombre, dorsal, posición, esCapitán]
type JugadorClave = [string, number, string, boolean];

const listaTitulares: string[] = [
  "Courtois",
  "Carvajal",
  "Rüdiger",
  "Alaba",
  "Mendy",
  "Valverde",
  "Camavinga",
  "Bellingham",
  "Rodrygo",
  "Vinicius Jr",
  "Mbappé"
];

const bancoSuplentes: readonly string[] = [
  "Lunin",
  "Modric",
  "Brahim",
  "Güler",
  "Endrick"
];

const capitanEquipo: JugadorClave = ["Luka Modric", 10, "Mediocampista", true];
const estrellaGoleadora: JugadorClave = ["Kylian Mbappé", 9, "Delantero", false];

console.log("=== ALINEACIÓN TITULAR (${listaTitulares.length} jugadores) ===");
listaTitulares.forEach((jugador, i) => {
  console.log(`${i + 1}. ${jugador}`);
});

console.log("\n=== BANCO DE SUPLENTES ===");
console.log(bancoSuplentes.join(", "));

console.log("\n=== JUGADORES CLAVE ===");
const imprimirFichaJugador = ([nombre, dorsal, posicion, capitan]: JugadorClave): void => {
  console.log(`Dorsal #${dorsal} | ${nombre} (${posicion}) ${capitan ? "[C]" : ""}`);
};

imprimirFichaJugador(capitanEquipo);
imprimirFichaJugador(estrellaGoleadora);
