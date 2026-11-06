// alias para los equipos
type Equipo = {
  nombre: string;
  victorias: number;
  empates: number;
  bonus: number;
};

function calcularPuntos(victorias: number, empates: number, bonus: number): number {
  const puntosPorVictorias = victorias * 3;
  const puntosPorEmpates = empates * 1;
  return puntosPorVictorias + puntosPorEmpates + bonus;
}

function obtenerPuntajeEquipo(equipo: Equipo): number {
  return calcularPuntos(equipo.victorias, equipo.empates, equipo.bonus);
}


const tabla: Equipo[] = [
  { nombre: "Campus Futsal", victorias: 8, empates: 2, bonus: 4 },
  { nombre: "Norte FC", victorias: 7, empates: 4, bonus: 2 },
  { nombre: "Titanes", victorias: 9, empates: 0, bonus: 1 },
];

console.log("--- TABLA DE PUNTAJES ---");

tabla.forEach((equipo) => {
  const puntosTotales = obtenerPuntajeEquipo(equipo);
  console.log(`Equipo: ${equipo.nombre} | Puntos Totales: ${puntosTotales}`);
});