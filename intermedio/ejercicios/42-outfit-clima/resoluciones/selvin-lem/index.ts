export {};

type Weather = "soleado" | "lluvioso" | "frio";

interface Garment {
    name: string;
    weather: Weather;
    warmth: number;
}

class Closet<T extends Garment> {
    constructor(private readonly clothes: T[]) {}

    suggest(weather: Weather): T[] {
        return this.clothes.filter((item) => item.weather === weather);
    }
}

const clothes: Garment[] = [
    { name: "Camiseta ligera", weather: "soleado", warmth: 1 },
    { name: "Chaqueta impermeable", weather: "lluvioso", warmth: 3 },
    { name: "Sueter de lana", weather: "frio", warmth: 5 },
    { name: "Botas", weather: "lluvioso", warmth: 2 },
];

const forecast: Weather = "lluvioso";
const outfit = new Closet(clothes).suggest(forecast);

console.log(`Outfit para un dia ${forecast}`);
outfit.forEach((item) => console.log(`${item.name} - abrigo ${item.warmth}/5`));
