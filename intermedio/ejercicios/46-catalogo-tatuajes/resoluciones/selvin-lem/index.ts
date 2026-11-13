export {};

type TattooStyle = "tradicional" | "lineal" | "geometrico";

interface TattooDesign {
    title: string;
    style: TattooStyle;
    minutes: number;
    price: number;
}

class TattooCatalog<T extends TattooDesign> {
    constructor(private readonly designs: T[]) {}

    findByStyle(style: TattooStyle): T[] {
        return this.designs.filter((design) => design.style === style);
    }

    estimatedPrice(design: T, hourlyRate: number): number {
        return Math.ceil((design.minutes / 60) * hourlyRate);
    }
}

const designs: TattooDesign[] = [
    { title: "Rosa clasica", style: "tradicional", minutes: 120, price: 180 },
    { title: "Luna fina", style: "lineal", minutes: 60, price: 95 },
    { title: "Sol modular", style: "geometrico", minutes: 150, price: 220 },
];

const catalog = new TattooCatalog(designs);
catalog.findByStyle("lineal").forEach((design) => {
    console.log(`${design.title}: $${design.price} (${design.minutes} min)`);
});
console.log(`Estimado por hora para una luna fina: $${catalog.estimatedPrice(designs[1], 100)}`);
