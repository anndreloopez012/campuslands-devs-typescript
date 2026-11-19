export {};

// Ejercicio 6: Funciones tipadas
// Contexto: Sistema de puntuacion deportiva
// Resolucion: Dulce Morales

type Equipo = {
  nombre: string;
  victorias: number;
  empates: number;
  derrotas: number;
  golesAFavor: number;
};

type ResultadoEquipo = {
  nombre: string;
  puntos: number;
};

// Funciones pequenas, cada una con parametros y retorno tipados.
// Los valores de puntos llegan como parametros con valor por defecto,
// asi no dependen de variables globales.

function calcularPuntosPorVictorias(victorias: number, puntosPorVictoria: number = 3): number {
  return victorias * puntosPorVictoria;
}

function calcularPuntosPorEmpates(empates: number, puntosPorEmpate: number = 1): number {
  return empates * puntosPorEmpate;
}

// Bonus ofensivo: 1 punto extra por cada 10 goles a favor
function calcularBonusOfensivo(golesAFavor: number, golesPorBonus: number = 10): number {
  return Math.floor(golesAFavor / golesPorBonus);
}

function calcularPuntajeTotal(equipo: Equipo): number {
  const puntosVictorias: number = calcularPuntosPorVictorias(equipo.victorias);
  const puntosEmpates: number = calcularPuntosPorEmpates(equipo.empates);
  const bonus: number = calcularBonusOfensivo(equipo.golesAFavor);
  return puntosVictorias + puntosEmpates + bonus;
}

function describirPuntaje(equipo: Equipo): string {
  const victorias: number = calcularPuntosPorVictorias(equipo.victorias);
  const empates: number = calcularPuntosPorEmpates(equipo.empates);
  const bonus: number = calcularBonusOfensivo(equipo.golesAFavor);
  const total: number = calcularPuntajeTotal(equipo);
  return `${equipo.nombre.padEnd(16)} V:${victorias} + E:${empates} + Bonus:${bonus} = ${total} pts`;
}

// Reto extra: recibe varios equipos y retorna el que tiene el mejor puntaje.
// Retorna null si la lista esta vacia.
function obtenerMejorEquipo(equipos: Equipo[]): ResultadoEquipo | null {
  let mejor: ResultadoEquipo | null = null;

  for (const equipo of equipos) {
    const puntos: number = calcularPuntajeTotal(equipo);
    if (mejor === null || puntos > mejor.puntos) {
      mejor = { nombre: equipo.nombre, puntos: puntos };
    }
  }

  return mejor;
}

function main(): void {
  const equipos: Equipo[] = [
    { nombre: "Tigres FC", victorias: 8, empates: 3, derrotas: 4, golesAFavor: 31 },
    { nombre: "Halcones", victorias: 9, empates: 1, derrotas: 5, golesAFavor: 18 },
    { nombre: "Deportivo Sur", victorias: 7, empates: 5, derrotas: 3, golesAFavor: 27 },
  ];

  console.log("============ TABLA DE PUNTOS ============");
  for (const equipo of equipos) {
    console.log(describirPuntaje(equipo));
  }
  console.log("=========================================");

  const lider: ResultadoEquipo | null = obtenerMejorEquipo(equipos);
  if (lider === null) {
    console.log("No hay equipos registrados.");
  } else {
    console.log(`Equipo lider: ${lider.nombre} con ${lider.puntos} puntos`);
  }
}

main();
