export {};

// Intermedio 01: Dashboard K/D de squad shooter
// Tematica: videojuegos shooters
// Resolucion: Dulce Morales

// ===================== MODELO =====================

type Rol = "asalto" | "francotirador" | "soporte" | "medico";
type Rango = "Elite" | "Veterano" | "Regular" | "Novato";

interface EstadisticaPartida {
  readonly jugadorId: string;
  readonly kills: number;
  readonly muertes: number;
  readonly asistencias: number;
}

interface Jugador {
  readonly id: string;
  readonly gamertag: string;
  readonly squad: string;
  readonly rol: Rol;
}

// Resultado ya calculado de un jugador (no se muta, se crea nuevo)
interface ResumenJugador {
  readonly jugador: Jugador;
  readonly partidas: number;
  readonly kills: number;
  readonly muertes: number;
  readonly asistencias: number;
  readonly kd: number;
  readonly kda: number;
  readonly rango: Rango;
}

interface ResumenSquad {
  readonly squad: string;
  readonly integrantes: number;
  readonly kdSquad: number; // kills totales / muertes totales del squad
  readonly mejorJugador: string;
}

type Validacion = { readonly valida: true } | { readonly valida: false; readonly motivo: string };

// ===================== DATOS DE PRUEBA =====================

const jugadores: readonly Jugador[] = [
  { id: "J1", gamertag: "NovaStrike", squad: "Alfa", rol: "asalto" },
  { id: "J2", gamertag: "SilentOwl", squad: "Alfa", rol: "francotirador" },
  { id: "J3", gamertag: "PatchUp", squad: "Alfa", rol: "medico" },
  { id: "J4", gamertag: "IronWall", squad: "Bravo", rol: "soporte" },
  { id: "J5", gamertag: "Ghost404", squad: "Bravo", rol: "asalto" },
  { id: "J6", gamertag: "Rookie_Max", squad: "Bravo", rol: "francotirador" },
];

const partidas: readonly EstadisticaPartida[] = [
  { jugadorId: "J1", kills: 24, muertes: 10, asistencias: 6 },
  { jugadorId: "J1", kills: 18, muertes: 12, asistencias: 4 },
  { jugadorId: "J2", kills: 15, muertes: 3, asistencias: 2 },
  { jugadorId: "J2", kills: 11, muertes: 4, asistencias: 1 },
  { jugadorId: "J3", kills: 5, muertes: 9, asistencias: 21 },
  { jugadorId: "J3", kills: 4, muertes: 7, asistencias: 18 },
  { jugadorId: "J4", kills: 12, muertes: 11, asistencias: 14 },
  { jugadorId: "J4", kills: 9, muertes: 8, asistencias: 10 },
  { jugadorId: "J5", kills: 20, muertes: 15, asistencias: 3 },
  { jugadorId: "J5", kills: 22, muertes: 9, asistencias: 5 },
  // Caso limite: partida perfecta, 0 muertes (no se puede dividir entre 0)
  { jugadorId: "J6", kills: 7, muertes: 0, asistencias: 2 },
  // Registros invalidos: deben descartarse
  { jugadorId: "J4", kills: -3, muertes: 5, asistencias: 0 },
  { jugadorId: "J99", kills: 10, muertes: 2, asistencias: 1 },
];

// ===================== VALIDACION =====================

function esEnteroNoNegativo(valor: number): boolean {
  return Number.isInteger(valor) && valor >= 0;
}

function validarPartida(partida: EstadisticaPartida, idsValidos: ReadonlySet<string>): Validacion {
  if (!idsValidos.has(partida.jugadorId)) {
    return { valida: false, motivo: `jugador ${partida.jugadorId} no existe` };
  }
  if (![partida.kills, partida.muertes, partida.asistencias].every(esEnteroNoNegativo)) {
    return { valida: false, motivo: `${partida.jugadorId} tiene valores negativos o decimales` };
  }
  return { valida: true };
}

// ===================== CALCULOS (funciones puras) =====================

function redondear(valor: number, decimales: number = 2): number {
  const factor: number = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

// Si no hay muertes, el K/D es igual a las kills (convencion de muchos shooters)
function calcularKd(kills: number, muertes: number): number {
  return redondear(kills / Math.max(1, muertes));
}

function calcularKda(kills: number, muertes: number, asistencias: number): number {
  return redondear((kills + asistencias) / Math.max(1, muertes));
}

function clasificarRango(kd: number): Rango {
  if (kd >= 3) return "Elite";
  if (kd >= 1.5) return "Veterano";
  if (kd >= 1) return "Regular";
  return "Novato";
}

function resumirJugador(jugador: Jugador, partidasValidas: readonly EstadisticaPartida[]): ResumenJugador {
  const propias: EstadisticaPartida[] = partidasValidas.filter(
    (partida: EstadisticaPartida): boolean => partida.jugadorId === jugador.id,
  );
  const kills: number = propias.reduce((total: number, p: EstadisticaPartida): number => total + p.kills, 0);
  const muertes: number = propias.reduce((total: number, p: EstadisticaPartida): number => total + p.muertes, 0);
  const asistencias: number = propias.reduce((total: number, p: EstadisticaPartida): number => total + p.asistencias, 0);
  const kd: number = calcularKd(kills, muertes);

  return {
    jugador,
    partidas: propias.length,
    kills,
    muertes,
    asistencias,
    kd,
    kda: calcularKda(kills, muertes, asistencias),
    rango: clasificarRango(kd),
  };
}

// Regla de negocio: para entrar al ranking se necesita un minimo de partidas
const MINIMO_PARTIDAS_RANKING: number = 2;

function esElegibleRanking(resumen: ResumenJugador): boolean {
  return resumen.partidas >= MINIMO_PARTIDAS_RANKING;
}

// Ordena numeros como numeros, sobre una copia (no muta el original)
function rankingPorKd(resumenes: readonly ResumenJugador[]): ResumenJugador[] {
  return [...resumenes].sort((a: ResumenJugador, b: ResumenJugador): number => b.kd - a.kd || b.kills - a.kills);
}

function resumirSquads(resumenes: readonly ResumenJugador[]): ResumenSquad[] {
  const porSquad: Record<string, ResumenJugador[]> = {};
  for (const resumen of resumenes) {
    const squad: string = resumen.jugador.squad;
    porSquad[squad] = [...(porSquad[squad] ?? []), resumen];
  }

  return Object.entries(porSquad).map(([squad, integrantes]: [string, ResumenJugador[]]): ResumenSquad => {
    const kills: number = integrantes.reduce((total: number, r: ResumenJugador): number => total + r.kills, 0);
    const muertes: number = integrantes.reduce((total: number, r: ResumenJugador): number => total + r.muertes, 0);
    const [mejor] = rankingPorKd(integrantes.filter(esElegibleRanking));
    return {
      squad,
      integrantes: integrantes.length,
      kdSquad: calcularKd(kills, muertes),
      mejorJugador: mejor ? mejor.jugador.gamertag : "-",
    };
  });
}

function rankingSquads(squads: readonly ResumenSquad[]): ResumenSquad[] {
  return [...squads].sort((a: ResumenSquad, b: ResumenSquad): number => b.kdSquad - a.kdSquad);
}

// ===================== SALIDA POR CONSOLA =====================

function formatearFila(posicion: number, r: ResumenJugador): string {
  return [
    `${posicion}.`.padEnd(3),
    r.jugador.gamertag.padEnd(11),
    r.jugador.squad.padEnd(6),
    r.jugador.rol.padEnd(14),
    `K ${String(r.kills).padStart(2)}`,
    `D ${String(r.muertes).padStart(2)}`,
    `A ${String(r.asistencias).padStart(2)}`,
    `K/D ${r.kd.toFixed(2).padStart(5)}`,
    `KDA ${r.kda.toFixed(2).padStart(5)}`,
    r.rango,
  ].join(" | ");
}

function imprimirDashboard(): void {
  const idsValidos: ReadonlySet<string> = new Set(jugadores.map((j: Jugador): string => j.id));

  const descartadas: string[] = [];
  const validas: EstadisticaPartida[] = [];
  for (const partida of partidas) {
    const resultado: Validacion = validarPartida(partida, idsValidos);
    if (resultado.valida) {
      validas.push(partida);
    } else {
      descartadas.push(resultado.motivo);
    }
  }

  const resumenes: ResumenJugador[] = jugadores.map((j: Jugador): ResumenJugador => resumirJugador(j, validas));
  const ranking: ResumenJugador[] = rankingPorKd(resumenes.filter(esElegibleRanking));
  const sinMinimo: ResumenJugador[] = resumenes.filter((r: ResumenJugador): boolean => !esElegibleRanking(r));

  console.log("================ DASHBOARD K/D ================");
  console.log(`Partidas validas: ${validas.length} | descartadas: ${descartadas.length}`);
  descartadas.forEach((motivo: string): void => console.log(`  - Descartada: ${motivo}`));

  console.log(`\n--- Ranking individual (por K/D, minimo ${MINIMO_PARTIDAS_RANKING} partidas) ---`);
  ranking.forEach((r: ResumenJugador, i: number): void => console.log(formatearFila(i + 1, r)));

  console.log(`\n--- Fuera del ranking (menos de ${MINIMO_PARTIDAS_RANKING} partidas) ---`);
  sinMinimo.forEach((r: ResumenJugador): void => {
    console.log(`${r.jugador.gamertag.padEnd(11)} | ${r.partidas} partida(s) | K/D ${r.kd.toFixed(2)}`);
  });

  console.log("\n--- Squads ---");
  rankingSquads(resumirSquads(resumenes)).forEach((s: ResumenSquad): void => {
    console.log(`${s.squad.padEnd(6)} | ${s.integrantes} jugadores | K/D del squad ${s.kdSquad.toFixed(2)} | MVP: ${s.mejorJugador}`);
  });

  const [mvp] = ranking;
  console.log("\n--- Resumen ---");
  console.log(`MVP general: ${mvp ? `${mvp.jugador.gamertag} (K/D ${mvp.kd.toFixed(2)})` : "sin datos"}`);
  const sinMuertes: ResumenJugador | undefined = resumenes.find((r: ResumenJugador): boolean => r.muertes === 0);
  if (sinMuertes !== undefined) {
    console.log(`Caso limite: ${sinMuertes.jugador.gamertag} tiene 0 muertes y su K/D es ${sinMuertes.kd.toFixed(2)} (no Infinity).`);
  }
}

imprimirDashboard();
