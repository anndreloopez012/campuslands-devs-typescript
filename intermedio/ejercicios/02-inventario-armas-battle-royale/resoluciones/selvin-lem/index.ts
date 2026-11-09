export {};

type Rarity = "comun" | "rara" | "epica" | "legendaria";

interface Weapon {
    name: string;
    category: string;
    rarity: Rarity;
    damage: number;
    ammo: number;
}

const inventory: Weapon[] = [
    { name: "Rifle de asalto", category: "Rifle", rarity: "epica", damage: 38, ammo: 90 },
    { name: "Escopeta tactica", category: "Escopeta", rarity: "rara", damage: 82, ammo: 24 },
    { name: "Pistola", category: "Secundaria", rarity: "comun", damage: 24, ammo: 45 },
    { name: "Rifle de precision", category: "Francotirador", rarity: "legendaria", damage: 96, ammo: 12 },
];

const availableWeapons = inventory.filter((weapon) => weapon.ammo > 0);
const totalAmmo = availableWeapons.reduce((total, weapon) => total + weapon.ammo, 0);
const strongestWeapon = [...availableWeapons].sort(
    (first, second) => second.damage - first.damage,
)[0];

console.log("Inventario de armas");
availableWeapons.forEach((weapon) => {
    console.log(
        `${weapon.name} | ${weapon.rarity} | Daño: ${weapon.damage} | Municion: ${weapon.ammo}`,
    );
});
console.log(`Municion total: ${totalAmmo}`);
console.log(`Arma de mayor daño: ${strongestWeapon?.name ?? "Ninguna"}`);
