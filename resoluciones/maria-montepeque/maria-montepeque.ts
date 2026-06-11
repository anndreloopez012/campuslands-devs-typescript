export {};

// Ejercicio 6: Funciones tipadas

type Equipo = {
  nombre: string;
  victorias: number;
  empates: number;
  bonusOfensivo: number;
};

const calcularPuntos = (v: number, e: number, b: number): number =>
  v * 3 + e + b;

const obtenerPuntajeEquipo = (eq: Equipo): number =>
  calcularPuntos(eq.victorias, eq.empates, eq.bonusOfensivo);

const obtenerLider = (equipos: Equipo[]): Equipo =>
  equipos.reduce((l, eq) =>
    obtenerPuntajeEquipo(eq) > obtenerPuntajeEquipo(l) ? eq : l,
  );

const tabla: Equipo[] = [
  { nombre: "Campus Futsal", victorias: 8, empates: 2, bonusOfensivo: 4 },
  { nombre: "Norte FC", victorias: 7, empates: 4, bonusOfensivo: 2 },
  { nombre: "Titanes", victorias: 9, empates: 0, bonusOfensivo: 1 },
];

tabla.forEach((eq) =>
  console.log(`${eq.nombre}: ${obtenerPuntajeEquipo(eq)} puntos`),
);

const lider: Equipo = obtenerLider(tabla);
console.log(`Lider: ${lider.nombre} con ${obtenerPuntajeEquipo(lider)} puntos`);