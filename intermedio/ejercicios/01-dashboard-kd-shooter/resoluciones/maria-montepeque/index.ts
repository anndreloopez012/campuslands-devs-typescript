export {};

type PlayerRole = "asalto" | "francotirador" | "soporte" | "reconocimiento";

interface Player {
  readonly id: number;
  readonly name: string;
  readonly role: PlayerRole;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
}

interface PlayerStats extends Player {
  readonly kd: number;
  readonly score: number;
}

interface SquadSummary {
  readonly totalKills: number;
  readonly totalDeaths: number;
  readonly squadKD: number;
  readonly topFragger: string;
  readonly mvp: string;
}

const isValidPlayer = (p: Player): boolean =>
  p.kills >= 0 && p.deaths >= 0 && p.assists >= 0 && p.name.trim().length > 0;

const calculateKD = (kills: number, deaths: number): number =>
  deaths === 0 ? kills : Number((kills / deaths).toFixed(2));

const calculateScore = (
  kills: number,
  assists: number,
  deaths: number,
): number => kills * 3 + assists - deaths;

const buildPlayerStats = (players: readonly Player[]): PlayerStats[] =>
  players
    .filter(isValidPlayer)
    .map((p) => ({
      ...p,
      kd: calculateKD(p.kills, p.deaths),
      score: calculateScore(p.kills, p.assists, p.deaths),
    }));

const rankByKD = (stats: readonly PlayerStats[]): PlayerStats[] =>
  [...stats].sort((a, b) => b.kd - a.kd);

const rankByScore = (stats: readonly PlayerStats[]): PlayerStats[] =>
  [...stats].sort((a, b) => b.score - a.score);

const summarizeSquad = (stats: readonly PlayerStats[]): SquadSummary => {
  const totalKills = stats.reduce((acc, p) => acc + p.kills, 0);
  const totalDeaths = stats.reduce((acc, p) => acc + p.deaths, 0);
  return {
    totalKills,
    totalDeaths,
    squadKD: calculateKD(totalKills, totalDeaths),
    topFragger: rankByKD(stats)[0]?.name ?? "N/A",
    mvp: rankByScore(stats)[0]?.name ?? "N/A",
  };
};

const printDashboard = (
  stats: readonly PlayerStats[],
  summary: SquadSummary,
): void => {
  console.log("--- Dashboard K/D Squad Shooter ---");
  rankByKD(stats).forEach((p, i) =>
    console.log(
      `${i + 1}. ${p.name} (${p.role}) - K/D: ${p.kd} - Score: ${p.score}`,
    ),
  );
  console.log("--- Resumen del Squad ---");
  console.log(`Kills totales: ${summary.totalKills}`);
  console.log(`Muertes totales: ${summary.totalDeaths}`);
  console.log(`K/D del squad: ${summary.squadKD}`);
  console.log(`Top fragger: ${summary.topFragger}`);
  console.log(`MVP: ${summary.mvp}`);
};

const squad: readonly Player[] = [
  { id: 1, name: "Vex", role: "asalto", kills: 24, deaths: 8, assists: 5 },
  {
    id: 2,
    name: "Nyx",
    role: "francotirador",
    kills: 31,
    deaths: 6,
    assists: 2,
  },
  { id: 3, name: "Riko", role: "soporte", kills: 10, deaths: 12, assists: 18 },
  {
    id: 4,
    name: "Tala",
    role: "reconocimiento",
    kills: 0,
    deaths: 0,
    assists: 4,
  },
];

const stats = buildPlayerStats(squad);
const summary = summarizeSquad(stats);
printDashboard(stats, summary);