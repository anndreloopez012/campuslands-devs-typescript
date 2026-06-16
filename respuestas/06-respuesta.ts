export {};

type EstadisticasEquipo = {
  nombre: string;
  victorias: number;
  empates: number;
  bonusOfensivo: number;
};

function calcularPuntos(victorias: number, empates: number, bonusOfensivo: number): number {
  return victorias * 3 + empates + bonusOfensivo;
}

function obtenerPuntajeEquipo(equipo: EstadisticasEquipo): number {
  return calcularPuntos(equipo.victorias, equipo.empates, equipo.bonusOfensivo);
}

function obtenerLider(equipos: EstadisticasEquipo[]): EstadisticasEquipo {
  return equipos.reduce((liderActual, equipo) =>
    obtenerPuntajeEquipo(equipo) > obtenerPuntajeEquipo(liderActual) ? equipo : liderActual,
  );
}

const tabla: EstadisticasEquipo[] = [
  { nombre: "Campus Futsal", victorias: 8, empates: 2, bonusOfensivo: 4 },
  { nombre: "Norte FC", victorias: 7, empates: 4, bonusOfensivo: 2 },
  { nombre: "Titanes", victorias: 9, empates: 0, bonusOfensivo: 1 },
];

const lider: EstadisticasEquipo = obtenerLider(tabla);
console.log(`Lider: ${lider.nombre} con ${obtenerPuntajeEquipo(lider)} puntos`);
