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

const getKD = (k: number, d: number): number =>
  d === 0 ? k : Number((k / d).toFixed(2));

const processSquad = (players: readonly Player[]) => {
  const stats = players
    .filter(
      (p) =>
        p.kills >= 0 &&
        p.deaths >= 0 &&
        p.assists >= 0 &&
        p.name.trim().length > 0,
    )
    .map((p) => ({
      ...p,
      kd: getKD(p.kills, p.deaths),
      score: p.kills * 3 + p.assists - p.deaths,
    }))
    .sort((a, b) => b.kd - a.kd);

  const summary = stats.reduce(
    (acc, p) => {
      const totalKills = acc.totalKills + p.kills;
      const totalDeaths = acc.totalDeaths + p.deaths;
      return {
        totalKills,
        totalDeaths,
        squadKD: getKD(totalKills, totalDeaths),
        topFragger: p.kills > (acc._maxK || 0) ? p.name : acc.topFragger,
        mvp: p.score > (acc._maxS || -Infinity) ? p.name : acc.mvp,
        _maxK: Math.max(acc._maxK || 0, p.kills),
        _maxS: Math.max(acc._maxS || -Infinity, p.score),
      };
    },
    {
      totalKills: 0,
      totalDeaths: 0,
      squadKD: 0,
      topFragger: "N/A",
      mvp: "N/A",
    } as SquadSummary & { _maxK?: number; _maxS?: number },
  );

  return { stats, summary };
};

const printDashboard = (
  stats: readonly PlayerStats[],
  summary: SquadSummary,
): void => {
  console.log("--- Dashboard K/D Squad Shooter ---");
  stats.forEach((p, i) =>
    console.log(
      `${i + 1}. ${p.name} (${p.role}) - K/D: ${p.kd} - Score: ${p.score}`,
    ),
  );
  console.log(
    "--- Resumen del Squad ---\nKills: %d\nMuertes: %d\nK/D: %d\nTop fragger: %s\nMVP: %s",
    summary.totalKills,
    summary.totalDeaths,
    summary.squadKD,
    summary.topFragger,
    summary.mvp,
  );
};

// Ejecución
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

const { stats, summary } = processSquad(squad);
printDashboard(stats, summary);
