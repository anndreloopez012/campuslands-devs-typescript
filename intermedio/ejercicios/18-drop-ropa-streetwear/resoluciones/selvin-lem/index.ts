export {};

interface ClothingItem {
    name: string;
    size: string;
    price: number;
    stock: number;
    sold: number;
}

const drop: ClothingItem[] = [
    { name: "Hoodie Eclipse", size: "M", price: 68, stock: 12, sold: 8 },
    { name: "Camiseta Pixel", size: "L", price: 32, stock: 20, sold: 15 },
    { name: "Gorra Norte", size: "Unica", price: 24, stock: 0, sold: 10 },
];

const available = drop.filter((item) => item.stock > 0);
const revenue = drop.reduce((sum, item) => sum + item.price * item.sold, 0);

console.log("Articulos disponibles");
available.forEach((item) => {
    console.log(`${item.name} (${item.size}) | $${item.price} | Stock: ${item.stock}`);
});
console.log(`Ventas del drop: $${revenue}`);
