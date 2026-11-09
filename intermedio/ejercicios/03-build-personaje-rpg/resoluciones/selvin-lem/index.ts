export {};

type ClassName = "guerrero" | "mago" | "arquero";

interface Character {
    name: string;
    className: ClassName;
    level: number;
    strength: number;
    intelligence: number;
    agility: number;
}

const character: Character = {
    name: "Kael",
    className: "guerrero",
    level: 12,
    strength: 18,
    intelligence: 7,
    agility: 11,
};

const totalStats =
    character.strength + character.intelligence + character.agility;
const mainStat = {
    guerrero: character.strength,
    mago: character.intelligence,
    arquero: character.agility,
}[character.className];

console.log(`Build de ${character.name}`);
console.log(`Clase: ${character.className} | Nivel: ${character.level}`);
console.log(`Fuerza: ${character.strength}`);
console.log(`Inteligencia: ${character.intelligence}`);
console.log(`Agilidad: ${character.agility}`);
console.log(`Puntos totales: ${totalStats}`);
console.log(`Atributo principal: ${mainStat}`);
