export {};

// Ejercicio 01: Introducción a TypeScript
// Contexto: Videojuegos Shooter - Operador Táctico Stefani

const nombreJugador: string = "Stefani-Valkyrie";
const armaPrincipal: string = "Fusil de Asalto Cuántico AR-50";
const municionDisponible: number = 180;
const tieneEscudoActivo: boolean = true;
const mapaActual: string = "Neo-Sector Alfa";
const modoJuego: string = "Supervivencia Táctica";

const estadoEscudo: string = tieneEscudoActivo ? "ONLINE (100%)" : "OFFLINE";

const reporteMision: string = [
  "=== REPORTE DE OPERADOR TÁCTICO ===",
  `Operador: ${nombreJugador}`,
  `Modo: ${modoJuego} | Ubicación: ${mapaActual}`,
  `Armamento: ${armaPrincipal}`,
  `Munición restante: ${municionDisponible} proyectiles`,
  `Sistema de escudo: ${estadoEscudo}`,
  "==================================="
].join("\n");

console.log(reporteMision);
