export {};

// Ejercicio 06: Funciones Tipadas
// Contexto: Sistema de Puntuación de Liga Deportiva

type Division = "Oro" | "Plata" | "Bronce";

interface EstadisticasClub {
  nombre: string;
  victorias: number;
  empates: number;
  derrotas: number;
  golesAFavor: number;
  golesEnContra: number;
}

const PUNTOS_VICTORIA: number = 3;
const PUNTOS_EMPATE: number = 1;
const PUNTOS_DERROTA: number = 0;

function calcularPuntajeTotal(victorias: number, empates: number, derrotas: number): number {
  return victorias * PUNTOS_VICTORIA + empates * PUNTOS_EMPATE + derrotas * PUNTOS_DERROTA;
}

function calcularDiferenciaGoles(favor: number, contra: number): number {
  return favor - contra;
}

function asignarDivision(puntos: number): Division {
  if (puntos >= 20) return "Oro";
  if (puntos >= 10) return "Plata";
  return "Bronce";
}

const tablaEquipos: EstadisticasClub[] = [
  { nombre: "Valkyrie FC", victorias: 8, empates: 2, derrotas: 0, golesAFavor: 26, golesEnContra: 5 },
  { nombre: "Titan Stars", victorias: 5, empates: 3, derrotas: 2, golesAFavor: 18, golesEnContra: 11 },
  { nombre: "Cyber Rovers", victorias: 2, empates: 1, derrotas: 7, golesAFavor: 9, golesEnContra: 22 }
];

console.log("=== TABLA GENERAL DE POSICIONES ===");
tablaEquipos.forEach((equipo) => {
  const puntos = calcularPuntajeTotal(equipo.victorias, equipo.empates, equipo.derrotas);
  const difGoles = calcularDiferenciaGoles(equipo.golesAFavor, equipo.golesEnContra);
  const division = asignarDivision(puntos);
  console.log(
    `${equipo.nombre.padEnd(16)} | Pts: ${puntos.toString().padStart(2)} | DG: ${difGoles > 0 ? "+" + difGoles : difGoles} | División: ${division}`
  );
});
