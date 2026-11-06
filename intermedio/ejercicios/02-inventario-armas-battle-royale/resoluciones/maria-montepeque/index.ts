export {};

type Rarity = "comun" | "raro" | "epico" | "legendario";

interface Weapon {
  readonly id: number;
  readonly name: string;
  readonly rarity: Rarity;
  readonly damage: number;
  readonly ammo: number;
}
interface Player {
  readonly id: number;
  readonly name: string;
  readonly inventory: readonly Weapon[];
}
interface PlayerRanking {
  readonly id: number;
  readonly name: string;
  readonly totalDamage: number;
  readonly avgDamage: number;
  readonly bestWeapon: string;
}

const MAX_SLOTS = 6;

const players: readonly Player[] = [
  {
    id: 1,
    name: "Kael",
    inventory: [
      { id: 101, name: "AKM", rarity: "raro", damage: 49, ammo: 30 },
      { id: 102, name: "Kar98k", rarity: "epico", damage: 79, ammo: 5 },
      { id: 103, name: "Pan", rarity: "comun", damage: 80, ammo: 0 },
    ],
  },
  {
    id: 2,
    name: "Nyra",
    inventory: [
      { id: 201, name: "M416", rarity: "raro", damage: 41, ammo: 30 },
      { id: 202, name: "AWM", rarity: "legendario", damage: 105, ammo: 5 },
    ],
  },
  { id: 3, name: "Bram", inventory: [] },
];

// 1. Procesar ranking e inválidos en un solo paso por la lista de jugadores
const invalidNames: string[] = [];
const ranking: PlayerRanking[] = players
  .map((p) => {
    const len = p.inventory.length;
    if (len === 0 || len > MAX_SLOTS) invalidNames.push(p.name);

    const stats = p.inventory.reduce(
      (acc, w) => ({
        total: acc.total + w.damage,
        best: w.damage > acc.maxD ? w.name : acc.best,
        maxD: Math.max(acc.maxD, w.damage),
      }),
      { total: 0, best: "Sin arma", maxD: 0 },
    );

    return {
      id: p.id,
      name: p.name,
      totalDamage: stats.total,
      avgDamage: len ? Number((stats.total / len).toFixed(1)) : 0,
      bestWeapon: stats.best,
    };
  })
  .sort((a, b) => b.totalDamage - a.totalDamage);

// 2. Salida limpia por consola
console.log("Ranking battle royale:");
ranking.forEach((e, i) =>
  console.log(
    `${i + 1}. ${e.name} | dano total: ${e.totalDamage} | promedio: ${e.avgDamage} | mejor arma: ${e.bestWeapon}`,
  ),
);

console.log(
  `Jugadores con inventario invalido: ${invalidNames.join(", ") || "ninguno"}`,
);
