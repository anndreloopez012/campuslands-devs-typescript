export {};



// TODO: crea funciones para calcular puntos.

type Equipo = {
  nombre: string;
  miembros: number;
  puntos: number;
  victorias: number;
  empates: number;
  bonus_ofensivo: number;
};

function calcular_puntos(victorias: number, empates: number, bonus_ofensivo: number): number {
  return victorias * 3 + empates + bonus_ofensivo;
}

function mejor_puntuacion(equipo: Equipo): number {
  return calcular_puntos(equipo.victorias, equipo.empates, equipo.bonus_ofensivo);
}

function lider(equipos: Equipo[]): Equipo {
  return equipos.reduce((liderActual, equipo) =>
    mejor_puntuacion(equipo) > mejor_puntuacion(liderActual) ? equipo : liderActual
  );
}

const Clasificacion: Equipo[] = [
  { nombre: "Rayos del Sur", miembros: 11, puntos: 0, victorias: 6, empates: 3, bonus_ofensivo: 3 },
  { nombre: "Deportivo Real", miembros: 11, puntos: 0, victorias: 10, empates: 1, bonus_ofensivo: 5 },
  { nombre: "Atlas City", miembros: 11, puntos: 0, victorias: 5, empates: 5, bonus_ofensivo: 0 }
];

const obtenerLider: Equipo = lider(Clasificacion);

// Accedemos a las propiedades para que el log sea legible
console.log(`El líder es ${obtenerLider.nombre} con ${mejor_puntuacion(obtenerLider)} puntos.`);

// hola