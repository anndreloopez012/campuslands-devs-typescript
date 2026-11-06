export {};

type Role = "tank" | "fighter" | "mage" | "support" | "marksman" | "assassin";

interface Hero {
  readonly id: number;
  readonly name: string;
  readonly role: Role;
  readonly winRate: number;
  readonly pickRate: number;
}
interface RotationSummary {
  readonly week: number;
  readonly rotation: readonly Hero[];
  readonly averageWinRate: number;
  readonly topHero: Hero | null;
}

const heroPool: readonly Hero[] = [
  { id: 1, name: "Ignis", role: "mage", winRate: 52.3, pickRate: 18.4 },
  { id: 2, name: "Boulder", role: "tank", winRate: 49.8, pickRate: 12.1 },
  {
    id: 3,
    name: "Shadowfang",
    role: "assassin",
    winRate: 55.6,
    pickRate: 22.7,
  },
  { id: 4, name: "Aria", role: "support", winRate: 51.2, pickRate: 15.3 },
  { id: 5, name: "Ragnor", role: "fighter", winRate: 48.9, pickRate: 19.6 },
  { id: 6, name: "Vex", role: "marksman", winRate: 53.7, pickRate: 20.1 },
  { id: 7, name: "Nyx", role: "assassin", winRate: 46.4, pickRate: 9.8 },
];

const buildRotationSummary = (
  heroes: readonly Hero[],
  week: number,
  size: number,
): RotationSummary => {
  if (size <= 0 || size > heroes.length)
    throw new Error("Tamaño de rotación inválido");

  const rotation = [...heroes]
    .sort((a, b) => b.pickRate - a.pickRate)
    .slice(0, size);

  const stats = rotation.reduce(
    (acc, h) => ({
      sumWR: acc.sumWR + h.winRate,
      top: !acc.top || h.winRate > acc.top.winRate ? h : acc.top,
    }),
    { sumWR: 0, top: null as Hero | null },
  );

  return {
    week,
    rotation,
    averageWinRate: rotation.length
      ? Number((stats.sumWR / rotation.length).toFixed(2))
      : 0,
    topHero: stats.top,
  };
};

const printSummary = (s: RotationSummary): void => {
  console.log(`Rotación semana ${s.week}`);
  s.rotation.forEach((h) =>
    console.log(
      `- ${h.name} (${h.role}) | WR: ${h.winRate}% | Pick: ${h.pickRate}%`,
    ),
  );
  console.log(
    `Winrate promedio: ${s.averageWinRate}%\nMejor héroe: ${s.topHero ? `${s.topHero.name} (${s.topHero.winRate}%)` : "N/A"}`,
  );
};

// Ejecución estándar
printSummary(buildRotationSummary(heroPool, 12, 5));

console.log("--- Caso límite: sin héroes disponibles ---");
const emptySummary = { rotation: [] as Hero[], topHero: null as Hero | null };
console.log(`Winrate promedio (vacío): 0%`);
console.log(`Mejor héroe (vacío): N/A`);
