export {};

// Ejercicio 6: Funciones tipadas

// Primer uso de un "type alias"
type EstadisticasEquipo = {
  nombre: string;
  victorias: number;
  empates: number;
  bonusOfensivo: number;
};

// Funcion pura: solo recibe numeros y devuelve un numero.
function calcularPuntos(
  victorias: number,
  empates: number,
  bonusOfensivo: number,
): number {
  const PUNTOS_POR_VICTORIA = 3;
  const PUNTOS_POR_EMPATE = 1;

  return (
    victorias * PUNTOS_POR_VICTORIA +
    empates * PUNTOS_POR_EMPATE +
    bonusOfensivo
  );
}

// Funcion auxiliar
function obtenerPuntajeEquipo(equipo: EstadisticasEquipo): number {
  return calcularPuntos(equipo.victorias, equipo.empates, equipo.bonusOfensivo);
}

// Reto extra
function encontrarLider(equipos: EstadisticasEquipo[]): EstadisticasEquipo {
  let lider: EstadisticasEquipo = equipos[0];

  for (const equipo of equipos) {
    if (obtenerPuntajeEquipo(equipo) > obtenerPuntajeEquipo(lider)) {
      lider = equipo;
    }
  }

  return lider;
}

// Datos de prueba.
const tabla: EstadisticasEquipo[] = [
  { nombre: "Campus Futsal", victorias: 8, empates: 2, bonusOfensivo: 4 },
  { nombre: "Norte FC", victorias: 7, empates: 4, bonusOfensivo: 2 },
  { nombre: "Titanes", victorias: 9, empates: 0, bonusOfensivo: 1 },
];

// Mostramos el puntaje de cada equipo.
for (const equipo of tabla) {
  console.log(`${equipo.nombre}: ${obtenerPuntajeEquipo(equipo)} puntos`);
}

// Identificamos y mostramos al lider.
const lider: EstadisticasEquipo = encontrarLider(tabla);
console.log(
  `\nLider: ${lider.nombre} con ${obtenerPuntajeEquipo(lider)} puntos`,
);
