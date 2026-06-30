export {};

// Ejercicio 6: Funciones tipadas
// Contexto: Sistema de puntuacion deportiva

// TODO: crea funciones para calcular puntos.

console.log("-------- Ejercicio 6: Funciones tipadas --------")

type EstadisticasEquipo = {
  nombre: string;
  victorias: number;
  empates: number;
  bonusOfensivo: number;
};

function calcularPuntos(equipo: EstadisticasEquipo): number {
  const puntosVictorias = equipo.victorias * 3;
  const puntosEmpates = equipo.empates * 1;
  const puntosBonus = equipo.bonusOfensivo;
  return puntosVictorias + puntosEmpates + puntosBonus;
}

function obtenerLider(equipos: EstadisticasEquipo[]): EstadisticasEquipo {
  let liderActual = equipos[0];
  for (let i = 1; i < equipos.length; i++) {
    const equipoAnalizado = equipos[i];
    if (calcularPuntos(equipoAnalizado) > calcularPuntos(liderActual)) {
      liderActual = equipoAnalizado;
    }
  }
  return liderActual;
}

const tabla: EstadisticasEquipo[] = [
  { nombre: "PSG", victorias: 6, empates: 2, bonusOfensivo: 2 },
  { nombre: "Dortmund", victorias: 5, empates: 3, bonusOfensivo: 2 },
  { nombre: "Juventus", victorias: 9, empates: 1, bonusOfensivo: 0 },
];

const lider = obtenerLider(tabla);
const puntosDelLider = calcularPuntos(lider);

console.log(tabla)
console.log(`Lider: ${lider.nombre} con ${puntosDelLider} puntos`);