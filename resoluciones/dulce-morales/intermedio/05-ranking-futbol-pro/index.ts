export {};

// Intermedio 05: Ranking de jugadores de futbol
// Tematica: futbol
// Resolucion: Dulce Morales
//
// Problema: comparar jugadores de posiciones distintas de forma justa.
// Un portero no mete goles y un delantero no ataja, asi que cada posicion
// tiene su propia formula, y todo se mide "por cada 90 minutos".

// ===================== MODELO =====================

type Posicion = "portero" | "defensa" | "mediocampista" | "delantero";

interface EstadisticasTemporada {
  readonly partidos: number;
  readonly minutos: number;
  readonly goles: number;
  readonly asistencias: number;
  readonly entradasGanadas: number;
  readonly pasesClave: number;
  readonly atajadas: number;
  readonly golesRecibidos: number;
  readonly tarjetasRojas: number;
}

interface Jugador {
  readonly id: number;
  readonly nombre: string;
  readonly club: string;
  readonly posicion: Posicion;
  readonly stats: EstadisticasTemporada;
}

// Pesos de cada estadistica (por 90 minutos) segun la posicion
type Pesos = Readonly<{
  goles: number;
  asistencias: number;
  entradasGanadas: number;
  pasesClave: number;
  atajadas: number;
  golesRecibidos: number;
}>;

interface FilaRanking {
  readonly jugador: Jugador;
  readonly rating: number;
  readonly contribuciones: number; // goles + asistencias
}

type Evaluacion =
  | { readonly estado: "clasificado"; readonly fila: FilaRanking }
  | { readonly estado: "pocos minutos"; readonly jugador: Jugador; readonly minutos: number }
  | { readonly estado: "invalido"; readonly jugador: Jugador; readonly motivo: string };

// ===================== REGLAS =====================

const MINUTOS_MINIMOS: number = 900; // equivale a 10 partidos completos
const PENALIZACION_ROJA: number = 0.5;

const PESOS: Readonly<Record<Posicion, Pesos>> = {
  portero: { goles: 0, asistencias: 1, entradasGanadas: 0, pasesClave: 0.2, atajadas: 1.2, golesRecibidos: -1.5 },
  defensa: { goles: 3, asistencias: 2, entradasGanadas: 1.5, pasesClave: 0.5, atajadas: 0, golesRecibidos: 0 },
  mediocampista: { goles: 4, asistencias: 3.5, entradasGanadas: 0.8, pasesClave: 1.2, atajadas: 0, golesRecibidos: 0 },
  delantero: { goles: 6, asistencias: 3, entradasGanadas: 0.2, pasesClave: 0.8, atajadas: 0, golesRecibidos: 0 },
};

// ===================== VALIDACION =====================

function validarStats(stats: EstadisticasTemporada): string | null {
  const valores: number[] = Object.values(stats);
  if (!valores.every((v: number): boolean => Number.isInteger(v) && v >= 0)) {
    return "hay valores negativos o decimales";
  }
  if (stats.minutos > stats.partidos * 120) {
    return `${stats.minutos} minutos es imposible en ${stats.partidos} partidos`;
  }
  return null;
}

// ===================== CALCULOS (funciones puras) =====================

function porNoventa(valor: number, minutos: number): number {
  return (valor / minutos) * 90;
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function calcularRating(jugador: Jugador): number {
  const s: EstadisticasTemporada = jugador.stats;
  const p: Pesos = PESOS[jugador.posicion];
  const bruto: number =
    porNoventa(s.goles, s.minutos) * p.goles +
    porNoventa(s.asistencias, s.minutos) * p.asistencias +
    porNoventa(s.entradasGanadas, s.minutos) * p.entradasGanadas +
    porNoventa(s.pasesClave, s.minutos) * p.pasesClave +
    porNoventa(s.atajadas, s.minutos) * p.atajadas +
    porNoventa(s.golesRecibidos, s.minutos) * p.golesRecibidos;
  // Base de 5: un jugador sin aportes queda en 5, y cada aporte suma segun su peso
  return redondear(5 + bruto - s.tarjetasRojas * PENALIZACION_ROJA);
}

function evaluarJugador(jugador: Jugador): Evaluacion {
  const error: string | null = validarStats(jugador.stats);
  if (error !== null) {
    return { estado: "invalido", jugador, motivo: error };
  }
  if (jugador.stats.minutos < MINUTOS_MINIMOS) {
    return { estado: "pocos minutos", jugador, minutos: jugador.stats.minutos };
  }
  return {
    estado: "clasificado",
    fila: {
      jugador,
      rating: calcularRating(jugador),
      contribuciones: jugador.stats.goles + jugador.stats.asistencias,
    },
  };
}

// Desempate: 1) rating, 2) contribuciones, 3) mas minutos, 4) nombre
function compararFilas(a: FilaRanking, b: FilaRanking): number {
  return (
    b.rating - a.rating ||
    b.contribuciones - a.contribuciones ||
    b.jugador.stats.minutos - a.jugador.stats.minutos ||
    a.jugador.nombre.localeCompare(b.jugador.nombre)
  );
}

function rankingGeneral(filas: readonly FilaRanking[]): FilaRanking[] {
  return [...filas].sort(compararFilas);
}

function mejorPorPosicion(filas: readonly FilaRanking[]): Map<Posicion, FilaRanking> {
  const mejores: Map<Posicion, FilaRanking> = new Map<Posicion, FilaRanking>();
  for (const fila of rankingGeneral(filas)) {
    if (!mejores.has(fila.jugador.posicion)) {
      mejores.set(fila.jugador.posicion, fila);
    }
  }
  return mejores;
}

// ===================== DATOS DE PRUEBA =====================

function stats(parcial: Partial<EstadisticasTemporada> & Pick<EstadisticasTemporada, "partidos" | "minutos">): EstadisticasTemporada {
  return { goles: 0, asistencias: 0, entradasGanadas: 0, pasesClave: 0, atajadas: 0, golesRecibidos: 0, tarjetasRojas: 0, ...parcial };
}

const jugadores: readonly Jugador[] = [
  { id: 1, nombre: "Valeria Rios", club: "Atletico Sur", posicion: "delantero", stats: stats({ partidos: 30, minutos: 2520, goles: 21, asistencias: 6, pasesClave: 34, entradasGanadas: 12 }) },
  { id: 2, nombre: "Diego Paz", club: "Real Norte", posicion: "delantero", stats: stats({ partidos: 32, minutos: 2700, goles: 18, asistencias: 9, pasesClave: 40, entradasGanadas: 8, tarjetasRojas: 1 }) },
  { id: 3, nombre: "Lucia Ortega", club: "Real Norte", posicion: "mediocampista", stats: stats({ partidos: 34, minutos: 2950, goles: 7, asistencias: 14, pasesClave: 88, entradasGanadas: 55 }) },
  { id: 4, nombre: "Mateo Cruz", club: "Deportivo Este", posicion: "mediocampista", stats: stats({ partidos: 28, minutos: 2300, goles: 4, asistencias: 8, pasesClave: 61, entradasGanadas: 70 }) },
  { id: 5, nombre: "Sara Molina", club: "Atletico Sur", posicion: "defensa", stats: stats({ partidos: 33, minutos: 2970, goles: 3, asistencias: 2, pasesClave: 15, entradasGanadas: 98 }) },
  { id: 6, nombre: "Hugo Vera", club: "Deportivo Este", posicion: "defensa", stats: stats({ partidos: 30, minutos: 2650, goles: 1, asistencias: 3, pasesClave: 10, entradasGanadas: 85, tarjetasRojas: 2 }) },
  { id: 7, nombre: "Ana Salas", club: "Real Norte", posicion: "portero", stats: stats({ partidos: 34, minutos: 3060, atajadas: 112, golesRecibidos: 28, pasesClave: 4 }) },
  { id: 8, nombre: "Tomas Leon", club: "Atletico Sur", posicion: "portero", stats: stats({ partidos: 31, minutos: 2790, atajadas: 95, golesRecibidos: 35, asistencias: 1 }) },
  // Caso empate: mismas estadisticas que Hugo Vera -> se desempata por nombre
  { id: 12, nombre: "Bruno Rey", club: "Real Norte", posicion: "defensa", stats: stats({ partidos: 30, minutos: 2650, goles: 1, asistencias: 3, pasesClave: 10, entradasGanadas: 85, tarjetasRojas: 2 }) },
  // Caso limite: muy buenos numeros pero pocos minutos -> no entra al ranking
  { id: 9, nombre: "Nico Bravo", club: "Real Norte", posicion: "delantero", stats: stats({ partidos: 9, minutos: 420, goles: 6, asistencias: 2, pasesClave: 7 }) },
  // Caso limite: justo en el minimo de minutos -> si entra
  { id: 10, nombre: "Ines Duarte", club: "Deportivo Este", posicion: "delantero", stats: stats({ partidos: 14, minutos: 900, goles: 5, asistencias: 3, pasesClave: 12, entradasGanadas: 4 }) },
  // Datos invalidos
  { id: 11, nombre: "Error Data", club: "Sin club", posicion: "defensa", stats: stats({ partidos: 3, minutos: 1200, entradasGanadas: 10 }) },
];

// ===================== SALIDA POR CONSOLA =====================

function formatearFila(posicion: number, fila: FilaRanking): string {
  const j: Jugador = fila.jugador;
  return `${String(posicion).padStart(2)}. ${j.nombre.padEnd(13)} ${j.club.padEnd(15)} ${j.posicion.padEnd(14)} rating ${fila.rating.toFixed(2).padStart(5)} | G+A ${String(fila.contribuciones).padStart(2)} | ${j.stats.minutos} min`;
}

function main(): void {
  const evaluaciones: Evaluacion[] = jugadores.map(evaluarJugador);
  const filas: FilaRanking[] = [];
  const avisos: string[] = [];

  for (const e of evaluaciones) {
    switch (e.estado) {
      case "clasificado":
        filas.push(e.fila);
        break;
      case "pocos minutos":
        avisos.push(`${e.jugador.nombre}: solo ${e.minutos} minutos (minimo ${MINUTOS_MINIMOS})`);
        break;
      case "invalido":
        avisos.push(`${e.jugador.nombre}: datos invalidos, ${e.motivo}`);
        break;
    }
  }

  console.log("====================== RANKING GENERAL ======================");
  rankingGeneral(filas).forEach((f: FilaRanking, i: number): void => console.log(formatearFila(i + 1, f)));

  console.log("\n================= MEJOR DE CADA POSICION =================");
  const posiciones: readonly Posicion[] = ["portero", "defensa", "mediocampista", "delantero"];
  const mejores: Map<Posicion, FilaRanking> = mejorPorPosicion(filas);
  for (const posicion of posiciones) {
    const fila: FilaRanking | undefined = mejores.get(posicion);
    console.log(`${posicion.padEnd(14)} ${fila ? `${fila.jugador.nombre} (${fila.rating.toFixed(2)})` : "sin jugadores"}`);
  }

  console.log("\n==================== FUERA DEL RANKING ====================");
  avisos.forEach((a: string): void => console.log(`- ${a}`));
  console.log(`\nClasificados: ${filas.length} de ${jugadores.length} jugadores`);
}

main();
