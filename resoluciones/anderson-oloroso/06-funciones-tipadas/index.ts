export {};

// Ejercicio 6: Funciones tipadas
// Contexto: Sistema de puntuacion deportiva

// TODO: crea funciones para calcular puntos.

function calcularPuntos(goles: number, asistencias: number): number {
  const puntosPorGol = 4;
  const puntosPorAsistencia = 3;
  return goles * puntosPorGol + asistencias * puntosPorAsistencia;
}

const goles = 10;
const asistencias = 5;
const puntosTotales = calcularPuntos(goles, asistencias);
console.log(`Puntos totales: ${puntosTotales}`);
