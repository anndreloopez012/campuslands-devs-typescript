export {};

type ArtworkFormat = "digital" | "tradicional" | "boceto";

interface Artwork {
    title: string;
    format: ArtworkFormat;
    year: number;
    score: number;
}

class Portfolio<T extends Artwork> {
    constructor(private readonly works: T[]) {}

    selectFormat(format: ArtworkFormat): T[] {
        return this.works.filter((work) => work.format === format);
    }

    averageScore(): number {
        if (this.works.length === 0) return 0;
        return this.works.reduce((sum, work) => sum + work.score, 0) / this.works.length;
    }
}

const works: Artwork[] = [
    { title: "Bosque violeta", format: "digital", year: 2025, score: 9 },
    { title: "Retrato de Ana", format: "tradicional", year: 2024, score: 8 },
    { title: "Ciudad en lluvia", format: "digital", year: 2026, score: 10 },
];

const portfolio = new Portfolio(works);
portfolio.selectFormat("digital").forEach((work) => {
    console.log(`${work.title} (${work.year})`);
});
console.log(`Calificacion promedio: ${portfolio.averageScore().toFixed(1)}/10`);
