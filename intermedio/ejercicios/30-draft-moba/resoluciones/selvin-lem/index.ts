export {};

type Lane = "superior" | "jungla" | "central" | "tirador" | "soporte";

interface Hero {
    name: string;
    lane: Lane;
    strength: number;
}

const heroes: Hero[] = [
    { name: "Borin", lane: "superior", strength: 8 },
    { name: "Nix", lane: "jungla", strength: 9 },
    { name: "Sora", lane: "central", strength: 10 },
    { name: "Vela", lane: "tirador", strength: 8 },
    { name: "Miro", lane: "soporte", strength: 7 },
    { name: "Kara", lane: "central", strength: 9 },
];

const draft: Hero[] = [];
const pickedLanes = new Set<Lane>();

for (const hero of [...heroes].sort((first, second) => second.strength - first.strength)) {
    if (!pickedLanes.has(hero.lane)) {
        draft.push(hero);
        pickedLanes.add(hero.lane);
    }
}

const totalStrength = draft.reduce((total, hero) => total + hero.strength, 0);
draft.forEach((hero) => console.log(`${hero.lane}: ${hero.name} (${hero.strength}/10)`));
console.log(`Roles cubiertos: ${pickedLanes.size} de 5`);
console.log(`Fuerza total del equipo: ${totalStrength}`);
