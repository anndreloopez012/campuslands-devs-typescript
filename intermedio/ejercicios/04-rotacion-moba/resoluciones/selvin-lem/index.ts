export {};

type Lane = "superior" | "central" | "inferior" | "jungla";

interface Hero {
    name: string;
    lane: Lane;
    available: boolean;
}

const heroes: Hero[] = [
    { name: "Astra", lane: "central", available: true },
    { name: "Borin", lane: "superior", available: true },
    { name: "Kira", lane: "inferior", available: false },
    { name: "Mako", lane: "jungla", available: true },
];

const rotation = heroes.filter((hero) => hero.available);
const lanes = new Set(rotation.map((hero) => hero.lane));

console.log("Heroes disponibles esta semana");
rotation.forEach((hero) => console.log(`${hero.name} - ${hero.lane}`));
console.log(`Heroes disponibles: ${rotation.length}`);
console.log(`Posiciones cubiertas: ${lanes.size}`);
