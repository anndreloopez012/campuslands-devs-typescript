export {};

type RolEscuadra = "Fragger" | "Support" | "Sniper" | "IGL";

interface EstadisticasJugador {
  readonly id: string;
  readonly nickname: string;
  readonly rol: RolEscuadra;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly dañoTotal: number;
}

interface ResumenJugador extends EstadisticasJugador {
  readonly kdRatio: number;
  readonly kdaRatio: number;
  readonly impactoPorRonda: number;
}

interface MetricasEscuadra {
  readonly totalKills: number;
  readonly totalDeaths: number;
  readonly totalAsistencias: number;
  readonly kdGeneral: number;
  readonly mvp: ResumenJugador;
}

function calcularRatio(kills: number, deaths: number): number {
  if (deaths === 0) {
    return kills;
  }
  return Number((kills / deaths).toFixed(2));
}

function procesarJugador(jugador: EstadisticasJugador): ResumenJugador {
  const deathsCount = jugador.deaths === 0 ? 1 : jugador.deaths;
  const kdRatio = calcularRatio(jugador.kills, jugador.deaths);
  const kdaRatio = Number(((jugador.kills + jugador.assists * 0.5) / deathsCount).toFixed(2));
  const impactoPorRonda = Number((jugador.dañoTotal / 10).toFixed(1));

  return {
    ...jugador,
    kdRatio,
    kdaRatio,
    impactoPorRonda,
  };
}

function generarDashboardSquad(jugadores: EstadisticasJugador[]): MetricasEscuadra {
  if (jugadores.length === 0) {
    throw new Error("No hay jugadores en la escuadra.");
  }

  const resumenes = jugadores.map(procesarJugador);

  const totalKills = resumenes.reduce((acc, curr) => acc + curr.kills, 0);
  const totalDeaths = resumenes.reduce((acc, curr) => acc + curr.deaths, 0);
  const totalAsistencias = resumenes.reduce((acc, curr) => acc + curr.assists, 0);
  const kdGeneral = calcularRatio(totalKills, totalDeaths);

  const mvp = [...resumenes].sort((a, b) => b.kdaRatio - a.kdaRatio)[0];

  return {
    totalKills,
    totalDeaths,
    totalAsistencias,
    kdGeneral,
    mvp,
  };
}

const squadAlpha: EstadisticasJugador[] = [
  { id: "sq-01", nickname: "Viper", rol: "IGL", kills: 14, deaths: 8, assists: 11, dañoTotal: 2150 },
  { id: "sq-02", nickname: "Apex", rol: "Fragger", kills: 22, deaths: 10, assists: 5, dañoTotal: 3100 },
  { id: "sq-03", nickname: "Ghost", rol: "Sniper", kills: 18, deaths: 4, assists: 7, dañoTotal: 2600 },
  { id: "sq-04", nickname: "Medic", rol: "Support", kills: 6, deaths: 7, assists: 19, dañoTotal: 1400 },
];

const dashboard = generarDashboardSquad(squadAlpha);

console.log("=== RESUMEN DE LA ESCUADRA ===");
console.log(`Kills: ${dashboard.totalKills} | Bajas: ${dashboard.totalDeaths} | Asistencias: ${dashboard.totalAsistencias}`);
console.log(`K/D Promedio de Escuadra: ${dashboard.kdGeneral}`);
console.log(`MVP: ${dashboard.mvp.nickname} (${dashboard.mvp.rol}) con K/D ${dashboard.mvp.kdRatio} y KDA ${dashboard.mvp.kdaRatio}`);
