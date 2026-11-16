export {};

// Ejercicio 3: Arrays y Tuplas
// Contexto: Equipos de futbol (futbol sala)
// Resolucion: Dulce Morales

// Array homogeneo de jugadores (solo strings)
const jugadores: string[] = ["Ana", "Lucia", "Sofia", "Valeria"];
jugadores.push("Camila"); // futbol sala: 5 jugadoras en cancha

// Reto extra: lista de dorsales (solo numeros), en el mismo orden que jugadores
const dorsales: Array<number> = [1, 4, 7, 9, 10];

// Goles de cada jugadora en el partido (solo numeros, sin strings)
const golesPorJugador: number[] = [0, 1, 2, 0, 1];

// Tupla del marcador: exactamente dos numeros [golesLocal, golesVisitante]
const marcador: [golesLocal: number, golesVisitante: number] = [4, 2];
const [golesLocal, golesVisitante] = marcador;

// Plantilla con dorsal usando map y join
const plantilla: string[] = jugadores.map(
  (jugador: string, indice: number): string => `#${dorsales[indice]} ${jugador}`,
);

// Reto extra: total de goles del partido y del equipo local
const totalGolesPartido: number = golesLocal + golesVisitante;
const totalGolesEquipo: number = golesPorJugador.reduce(
  (suma: number, goles: number): number => suma + goles,
  0,
);

console.log("========= PARTIDO DE FUTBOL SALA =========");
console.log("Plantilla:");
console.log(`  ${plantilla.join("\n  ")}`);
console.log(`Dorsales: ${dorsales.join(", ")}`);
console.log(`Marcador: Local ${golesLocal} - ${golesVisitante} Visitante`);
console.log(`Goles del equipo local (por jugadora): ${totalGolesEquipo}`);
console.log(`Total de goles del partido: ${totalGolesPartido}`);
console.log("==========================================");
