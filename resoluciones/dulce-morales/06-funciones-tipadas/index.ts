export {};

// Ejercicio 6: Funciones tipadas
// Contexto: Sistema de puntuacion deportiva

type informacionEquipo = {
  nombre: string;
  victorias: number;
  empates: number;
  bonusOfensivo: number;
};

// TODO: crea funciones para calcular puntos.
function calcularPuntosEquipo(
  victorias: number,
  empates: number,
  bonusOfensivo: number,
): number {
  return victorias * 3 + empates + bonusOfensivo;
}
//
function obtenerPuntajeTotal(equipo: informacionEquipo): number {
  return calcularPuntosEquipo(
    equipo.victorias,
    equipo.empates,
    equipo.bonusOfensivo,
  );
}

function obtenerEquipoLider(equipos: informacionEquipo[]): informacionEquipo {
  return equipos.reduce(
    (
      liderActual: informacionEquipo,
      equipoActual: informacionEquipo,
    ): informacionEquipo => {
      const puntosLider = obtenerPuntajeTotal(liderActual);
      const puntosActual = obtenerPuntajeTotal(equipoActual);
      return puntosActual > puntosLider ? equipoActual : liderActual;
    },
  );
}
// Equipos Participantes
const tablaClasificacion: informacionEquipo[] = [
  { nombre: "Campus Futsal", victorias: 8, empates: 2, bonusOfensivo: 4 },
  { nombre: "Norte FC", victorias: 7, empates: 4, bonusOfensivo: 2 },
  { nombre: "Titanes", victorias: 9, empates: 0, bonusOfensivo: 1 },
];
//Identificar el equipo líder
const lider: informacionEquipo = obtenerEquipoLider(tablaClasificacion);
const puntajeLider: number = obtenerPuntajeTotal(lider);
//Imprime la tabla de calificaciones y el equpo lider con el puntaje total
console.log("Tabla de Clasificación:");
console.table(tablaClasificacion);

console.log(`Lider: ${lider.nombre} con ${puntajeLider} puntos`);
