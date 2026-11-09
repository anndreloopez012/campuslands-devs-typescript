export {};

type Rarity = "comun" | "rara" | "epica" | "legendaria";

interface Skin {
    name: string;
    rarity: Rarity;
    price: number;
    seller: string;
}

const market: Skin[] = [
    { name: "Nebula", rarity: "epica", price: 42, seller: "Lynx" },
    { name: "Frostbite", rarity: "legendaria", price: 115, seller: "Kiro" },
    { name: "Redline", rarity: "rara", price: 18, seller: "Mika" },
    { name: "Nebula", rarity: "epica", price: 36, seller: "Zed" },
];

const wantedSkin = "Nebula";
const offers = market
    .filter((skin) => skin.name === wantedSkin && skin.price > 0)
    .sort((first, second) => first.price - second.price);
const averagePrice =
    offers.reduce((total, skin) => total + skin.price, 0) / (offers.length || 1);

console.log(`Ofertas para ${wantedSkin}`);
offers.forEach((skin) => console.log(`${skin.seller}: $${skin.price} (${skin.rarity})`));
console.log(`Mejor precio: $${offers[0]?.price ?? "sin ofertas"}`);
console.log(`Precio promedio: $${offers.length ? averagePrice.toFixed(2) : "N/A"}`);
