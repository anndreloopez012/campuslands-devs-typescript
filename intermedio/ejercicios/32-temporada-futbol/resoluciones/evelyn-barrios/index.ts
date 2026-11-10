export {};

type RolPlantilla = "Titular Indiscutible" | "Rotacion" | "Promesa Juvenil" | "Transferible";

interface FutbolistaCarrera {
  readonly id: string;
  readonly nombre: string;
  readonly edad: number;
  mediaActual: number;
  potencialMaximo: number;
  readonly rol: RolPlantilla;
  partidosDisputados: number;
  golesAnotados: number;
}

interface ResumenTemporada {
  readonly club: string;
  readonly partidosJugadosTotal: number;
  readonly promedioMediaEquipo: number;
  readonly maximoGoleador: string;
  readonly jugadoresConMayorCrecimiento: readonly string[];
}

function simularProgresionTemporada(jugadores: FutbolistaCarrera[]): ResumenTemporada {
  const evolucionados: string[] = [];

  for (const j of jugadores) {
    if (j.partidosDisputados >= 25 && j.mediaActual < j.potencialMaximo) {
      const subida = j.edad <= 22 ? 3 : 1;
      j.mediaActual = Math.min(j.potencialMaximo, j.mediaActual + subida);
      evolucionados.push(`${j.nombre} (+${subida} OVR)`);
    }
  }

  const sumaMedia = jugadores.reduce((acc, j) => acc + j.mediaActual, 0);
  const promedioMedia = Number((sumaMedia / jugadores.length).toFixed(1));
  const pichichi = [...jugadores].sort((a, b) => b.golesAnotados - a.golesAnotados)[0];

  return {
    club: "Real Santander FC",
    partidosJugadosTotal: 38,
    promedioMediaEquipo: promedioMedia,
    maximoGoleador: `${pichichi.nombre} (${pichichi.golesAnotados} goles)`,
    jugadoresConMayorCrecimiento: evolucionados,
  };
}

const plantillaCarrera: FutbolistaCarrera[] = [
  { id: "f-01", nombre: "Alejandro Garnacho", edad: 20, mediaActual: 81, potencialMaximo: 88, rol: "Titular Indiscutible", partidosDisputados: 32, golesAnotados: 12 },
  { id: "f-02", nombre: "Kobbie Mainoo", edad: 19, mediaActual: 79, potencialMaximo: 89, rol: "Titular Indiscutible", partidosDisputados: 30, golesAnotados: 5 },
  { id: "f-03", nombre: "Casemiro", edad: 32, mediaActual: 84, potencialMaximo: 84, rol: "Rotacion", partidosDisputados: 26, golesAnotados: 2 },
];

console.log("=== TEMPORADA MODO CARRERA FUTBOL ===");
const balanceAnual = simularProgresionTemporada(plantillaCarrera);
console.log(`Club: ${balanceAnual.club} | Media Global: ${balanceAnual.promedioMediaEquipo}`);
console.log(`Goleador del anio: ${balanceAnual.maximoGoleador}`);
console.log("Crecimiento de jovenes talentos:", balanceAnual.jugadoresConMayorCrecimiento.join(", "));