export {};

type Rarity = "comun" | "rara" | "epica" | "legendaria";

interface LootItem {
    name: string;
    rarity: Rarity;
    value: number;
}

const loot: LootItem[] = [
    { name: "Pocion", rarity: "comun", value: 8 },
    { name: "Arco lunar", rarity: "epica", value: 90 },
    { name: "Anillo antiguo", rarity: "legendaria", value: 180 },
    { name: "Cuero reforzado", rarity: "rara", value: 25 },
    { name: "Gema azul", rarity: "epica", value: 65 },
];

const inventory = loot.reduce<Record<Rarity, LootItem[]>>(
    (groups, item) => {
        groups[item.rarity].push(item);
        return groups;
    },
    { comun: [], rara: [], epica: [], legendaria: [] },
);

for (const rarity of Object.keys(inventory) as Rarity[]) {
    const items = inventory[rarity];
    const totalValue = items.reduce((total, item) => total + item.value, 0);
    console.log(`${rarity}: ${items.length} objetos, valor total ${totalValue}`);
}
