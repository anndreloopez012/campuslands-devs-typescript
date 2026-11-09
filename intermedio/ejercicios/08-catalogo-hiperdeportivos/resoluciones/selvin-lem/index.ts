export {};

interface Hypercar {
    brand: string;
    model: string;
    topSpeed: number;
    price: number;
}

const cars: Hypercar[] = [
    { brand: "Aurelio", model: "Vortex", topSpeed: 410, price: 2400000 },
    { brand: "Velox", model: "R9", topSpeed: 395, price: 1800000 },
    { brand: "Nero", model: "Furia", topSpeed: 425, price: 3200000 },
];

const fastestFirst = [...cars].sort(
    (first, second) => second.topSpeed - first.topSpeed,
);
const underBudget = cars.filter((car) => car.price <= 2500000);

console.log("Catalogo de hiperdeportivos");
fastestFirst.forEach((car) => {
    console.log(`${car.brand} ${car.model} - ${car.topSpeed} km/h - $${car.price}`);
});
console.log(`Modelos por debajo de $2,500,000: ${underBudget.length}`);
